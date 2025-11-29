use anchor_lang::{prelude::*, system_program::{System as SystemProgram}};
use anchor_spl::{
    associated_token::{AssociatedToken, Create},
    token::{self, Token, TokenAccount, Transfer},
};
use crate::state::*;
use crate::error::TimeCapsuleError;

pub fn handler(
    ctx: Context<AddStake>,
    amount: u64,
    stake_destination: StakeDestination,
    destination_address: Option<Pubkey>,
) -> Result<()> {
    let capsule = &mut ctx.accounts.capsule;
    let escrow = &mut ctx.accounts.escrow;
    
    // Validate capsule is active
    require!(capsule.status == CapsuleStatus::Active, TimeCapsuleError::InvalidStatus);
    
    // Validate amount
    require!(amount > 0, TimeCapsuleError::InvalidStakeAmount);
    
    // Validate destination
    if stake_destination == StakeDestination::Charity || 
       stake_destination == StakeDestination::CommunityPool {
        require!(
            destination_address.is_some(),
            TimeCapsuleError::InvalidDestinationAddress
        );
    }
    
    // Update capsule state
    capsule.stake_amount = amount;
    capsule.stake_mint = ctx.accounts.stake_mint.key();
    capsule.stake_destination = stake_destination;
    capsule.destination_address = destination_address;
    
    // Initialize escrow
    escrow.capsule = capsule.key();
    escrow.amount = amount;
    escrow.mint = ctx.accounts.stake_mint.key();
    escrow.bump = ctx.bumps.escrow;
    
    // Transfer funds
    if ctx.accounts.stake_mint.key() == SystemProgram::id() {
        // Transfer SOL
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: escrow.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(transfer_ctx, amount)?;
    } else {
        // Transfer SPL
        
        // 1. Initialize Escrow ATA if needed
        let escrow_stake_account = &ctx.accounts.escrow_stake_account;
        
        if escrow_stake_account.data_is_empty() {
            let cpi_context = CpiContext::new(
                ctx.accounts.associated_token_program.to_account_info(),
                Create {
                    payer: ctx.accounts.creator.to_account_info(),
                    associated_token: escrow_stake_account.to_account_info(),
                    authority: escrow.to_account_info(),
                    mint: ctx.accounts.stake_mint.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                },
            );
            anchor_spl::associated_token::create(cpi_context)?;
        }
        
        // 2. Transfer Tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_stake_account.to_account_info(),
                to: escrow_stake_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct AddStake<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [b"capsule", creator.key().as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
    
    #[account(
        init,
        payer = creator,
        space = Escrow::LEN,
        seeds = [b"escrow", capsule.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Can be System Program or Mint
    pub stake_mint: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    /// CHECK: Checked in handler (Source ATA)
    #[account(mut)]
    pub creator_stake_account: UncheckedAccount<'info>,
    
    /// CHECK: Checked in handler (Escrow ATA)
    #[account(mut)]
    pub escrow_stake_account: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}
