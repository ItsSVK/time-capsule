use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::CapsuleOpened;

pub fn handler(ctx: Context<OpenForVoting>) -> Result<()> {
    let clock = Clock::get()?;
    let capsule = &mut ctx.accounts.capsule;
    
    // Validate capsule is in Active status
    require!(
        capsule.status == CapsuleStatus::Active,
        TimeCapsuleError::InvalidStatus
    );
    
    // Validate timestamp has passed
    require!(
        clock.unix_timestamp >= capsule.open_timestamp,
        TimeCapsuleError::CapsuleNotReady
    );
    
    // Update status
    capsule.status = CapsuleStatus::OpenForVoting;
    capsule.voting_end_timestamp = clock.unix_timestamp.checked_add(capsule.voting_duration).ok_or(TimeCapsuleError::ArithmeticOverflow)?;
    
    // Emit event
    emit!(CapsuleOpened {
        capsule: capsule.key(),
        opened_at: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct OpenForVoting<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
}
