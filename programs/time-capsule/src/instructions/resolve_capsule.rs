use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::CapsuleResolved;

pub fn handler(ctx: Context<ResolveCapsule>) -> Result<()> {
    let clock = Clock::get()?;
    let capsule = &mut ctx.accounts.capsule;
    
    // Validate capsule is open for voting
    require!(
        capsule.status == CapsuleStatus::OpenForVoting,
        TimeCapsuleError::InvalidStatus
    );
    
    // Validate voting period has ended
    require!(
        clock.unix_timestamp >= capsule.voting_end_timestamp,
        TimeCapsuleError::VotingPeriodNotEnded
    );
    
    // Check quorum
    let total_votes = capsule.yes_votes
        .checked_add(capsule.no_votes)
        .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
    
    // require!(
    //     total_votes >= capsule.quorum,
    //     TimeCapsuleError::QuorumNotReached
    // );
    
    // Determine result (majority wins) and QuorumNotReached as failure
    let result = if total_votes >= capsule.quorum {
        if capsule.yes_votes > capsule.no_votes {
            CapsuleResult::Success
        } else {
            CapsuleResult::Failure
        }
    } else {
        CapsuleResult::Failure
    };
    
    capsule.result = Some(result.clone());
    capsule.status = CapsuleStatus::Resolved;
    
    // Emit event
    emit!(CapsuleResolved {
        capsule: capsule.key(),
        result: result == CapsuleResult::Success,
        yes_votes: capsule.yes_votes,
        no_votes: capsule.no_votes,
        resolved_at: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct ResolveCapsule<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
}
