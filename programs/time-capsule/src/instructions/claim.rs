use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::StakeClaimed;

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    let capsule = &mut ctx.accounts.capsule;
    let escrow = &ctx.accounts.escrow;
    
    // Validate capsule is resolved
    require!(
        capsule.status == CapsuleStatus::Resolved,
        TimeCapsuleError::NotResolved
    );
    
    // Validate there's stake to claim
    require!(
        capsule.stake_amount > 0,
        TimeCapsuleError::NoStakeToClaim
    );
    
    let result = capsule.result.as_ref().unwrap();
    let recipient = match result {
        CapsuleResult::Success => {
            // Return stake to creator
            capsule.creator
        }
        CapsuleResult::Failure => {
            // Distribute based on stake_destination
            match capsule.stake_destination {
                StakeDestination::ReturnToCreator => capsule.creator,
                StakeDestination::CommunityPool | StakeDestination::Charity => {
                    capsule.destination_address.unwrap()
                }
                StakeDestination::TopVoters => {
                    // For now, send to community pool
                    // TODO: Implement voter reward distribution
                    capsule.destination_address.unwrap()
                }
            }
        }
    };
    
    // Validate recipient
    require!(
        ctx.accounts.recipient.key() == recipient,
        TimeCapsuleError::Unauthorized
    );
    
    let amount = escrow.amount;
    
    // Transfer from escrow to recipient
    if capsule.stake_mint == System::id() {
        // Transfer SOL stake amount to recipient
        // The remaining rent will be returned via the 'close' constraint
        **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
            .to_account_info()
            .lamports()
            .checked_sub(amount)
            .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
        
        **ctx.accounts.recipient.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .recipient
            .to_account_info()
            .lamports()
            .checked_add(amount)
            .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
        
        // Note: The escrow account will be closed by Anchor's 'close' constraint,
        // which will transfer the remaining rent lamports to the recipient
    } else {
        // Transfer SPL tokens
        let capsule_key = capsule.key();
        let seeds = &[
            b"escrow",
            capsule_key.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_stake_account.to_account_info(),
                to: ctx.accounts.recipient_stake_account.to_account_info(),
                authority: escrow.to_account_info(),
            },
            signer,
        );
        
        token::transfer(transfer_ctx, amount)?;
    }
    
    // Reset stake amount to 0 after claiming
    capsule.stake_amount = 0;
    
    // Emit event
    emit!(StakeClaimed {
        capsule: capsule.key(),
        recipient,
        amount,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump,
        constraint = capsule.status == CapsuleStatus::Resolved @ TimeCapsuleError::NotResolved,
        constraint = capsule.stake_amount > 0 @ TimeCapsuleError::NoStakeToClaim
    )]
    pub capsule: Account<'info, Capsule>,
    
    #[account(
        mut,
        seeds = [b"escrow", capsule.key().as_ref()],
        bump = escrow.bump,
        close = recipient
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Token account for escrow (only for SPL tokens)
    #[account(mut)]
    pub escrow_stake_account: UncheckedAccount<'info>,
    
    /// CHECK: Token account for recipient (only for SPL tokens)
    #[account(mut)]
    pub recipient_stake_account: UncheckedAccount<'info>,
    
    /// CHECK: Validated in handler
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
