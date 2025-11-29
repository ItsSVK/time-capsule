use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::TimeCapsuleError;
use crate::events::VoteCast;

pub fn handler(ctx: Context<CastVote>, vote: bool) -> Result<()> {
    let clock = Clock::get()?;
    let capsule = &mut ctx.accounts.capsule;
    let voter_record = &mut ctx.accounts.voter_record;
    
    // Validate capsule is open for voting
    require!(
        capsule.status == CapsuleStatus::OpenForVoting,
        TimeCapsuleError::InvalidStatus
    );
    
    // Validate voting period hasn't ended
    require!(
        clock.unix_timestamp < capsule.voting_end_timestamp,
        TimeCapsuleError::VotingPeriodEnded
    );
    
    // Initialize voter record
    voter_record.capsule = capsule.key();
    voter_record.voter = ctx.accounts.voter.key();
    voter_record.vote = vote;
    voter_record.timestamp = clock.unix_timestamp;
    voter_record.bump = ctx.bumps.voter_record;
    
    // Update vote tallies
    if vote {
        capsule.yes_votes = capsule.yes_votes
            .checked_add(1)
            .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
    } else {
        capsule.no_votes = capsule.no_votes
            .checked_add(1)
            .ok_or(TimeCapsuleError::ArithmeticOverflow)?;
    }
    
    // Emit event
    emit!(VoteCast {
        capsule: capsule.key(),
        voter: ctx.accounts.voter.key(),
        vote,
        yes_votes: capsule.yes_votes,
        no_votes: capsule.no_votes,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"capsule", capsule.creator.as_ref(), capsule.open_timestamp.to_le_bytes().as_ref()],
        bump = capsule.bump
    )]
    pub capsule: Account<'info, Capsule>,
    
    #[account(
        init,
        payer = voter,
        space = VoterRecord::LEN,
        seeds = [b"voter", capsule.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
