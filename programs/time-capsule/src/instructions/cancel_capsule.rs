use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::CapsuleCancelled;

pub fn handler(ctx: Context<CancelCapsule>) -> Result<()> {
    let clock = Clock::get()?;
    let capsule = &mut ctx.accounts.capsule;
    
    // Validate capsule is in Active status
    require!(
        capsule.status == CapsuleStatus::Active,
        TimeCapsuleError::InvalidStatus
    );
    
    // Validate caller is creator
    require!(
        ctx.accounts.creator.key() == capsule.creator,
        TimeCapsuleError::Unauthorized
    );
    
    // Update status
    capsule.status = CapsuleStatus::Cancelled;
    
    // Return stake if any
    if capsule.stake_amount > 0 {
        // Validate escrow exists when stake_amount > 0
        require!(
            ctx.accounts.escrow.is_some(),
            TimeCapsuleError::InvalidStakeAmount
        );
        
        // Escrow must exist when stake_amount > 0
        let escrow = ctx.accounts.escrow.as_ref().unwrap();
        
        // Validate escrow belongs to this capsule
        require!(
            escrow.capsule == capsule.key(),
            TimeCapsuleError::InvalidStakeAmount
        );
        
        let amount = escrow.amount;
        
        // Get bump from escrow account (stored during creation)
        let bump = escrow.bump;
        
        let escrow_info = escrow.to_account_info();
        
        if capsule.stake_mint == System::id() {
            // Transfer SOL back
            **escrow_info.try_borrow_mut_lamports()? = escrow_info
                .lamports()
                .checked_sub(amount)
                .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
            
            **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? = ctx
                .accounts
                .creator
                .to_account_info()
                .lamports()
                .checked_add(amount)
                .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
        } else {
            // Transfer SPL tokens back
            let capsule_key = capsule.key();
            let seeds = &[
                b"escrow",
                capsule_key.as_ref(),
                &[bump],
            ];
            let signer = &[&seeds[..]];
            
            let transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_stake_account.as_ref().unwrap().to_account_info(),
                    to: ctx.accounts.creator_stake_account.as_ref().unwrap().to_account_info(),
                    authority: escrow_info,
                },
                signer,
            );
            
            token::transfer(transfer_ctx, amount)?;
        }
        
        // Reset stake amount to 0 after returning stake
        capsule.stake_amount = 0;
    }
    
    // Emit event
    emit!(CapsuleCancelled {
        capsule: capsule.key(),
        creator: ctx.accounts.creator.key(),
        cancelled_at: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct CancelCapsule<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
    
    /// CHECK: Escrow account (only required if stake_amount > 0)
    /// No PDA constraints - validated manually in handler
    #[account(mut)]
    pub escrow: Option<Account<'info, Escrow>>,
    
    #[account(mut)]
    pub escrow_stake_account: Option<Account<'info, TokenAccount>>,
    
    #[account(mut)]
    pub creator_stake_account: Option<Account<'info, TokenAccount>>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
