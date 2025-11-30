use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::CapsuleClosed;

/// Close a capsule account and reclaim rent.
/// Can only be called by the creator on cancelled or resolved capsules.
pub fn handler(ctx: Context<CloseCapsule>) -> Result<()> {
    let capsule = &ctx.accounts.capsule;
    
    // Validate caller is creator
    require!(
        ctx.accounts.creator.key() == capsule.creator,
        TimeCapsuleError::Unauthorized
    );
    
    // Validate capsule is in a final state (cancelled or resolved)
    require!(
        capsule.status == CapsuleStatus::Cancelled || capsule.status == CapsuleStatus::Resolved,
        TimeCapsuleError::InvalidStatus
    );
    
    // Ensure no unclaimed stake remains
    require!(
        capsule.stake_amount == 0,
        TimeCapsuleError::StakeNotClaimed
    );
    
    // Emit event before closing
    emit!(CapsuleClosed {
        capsule: capsule.key(),
        creator: ctx.accounts.creator.key(),
        closed_at: Clock::get()?.unix_timestamp,
    });
    
    // The account will be closed automatically due to the `close` constraint
    Ok(())
}

#[derive(Accounts)]
pub struct CloseCapsule<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump,
        close = creator
    )]
    pub capsule: Account<'info, Capsule>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

