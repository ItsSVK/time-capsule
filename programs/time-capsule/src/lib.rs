use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("BneXxLPvUiwVsuDxWcPvHUd6rwwN9m2huxKLfqVTYG1F");

#[program]
pub mod time_capsule {
    use super::*;

    /// Create a new time capsule with optional stake
    pub fn initialize_capsule(
        ctx: Context<InitializeCapsule>,
        metadata_uri: String,
        open_timestamp: i64,
        voting_duration: i64,
        quorum: u64,
        name: String,
        symbol: String,
    ) -> Result<()> {
        instructions::initialize_capsule::handler(
            ctx,
            metadata_uri,
            open_timestamp,
            voting_duration,
            quorum,
            name,
            symbol,
        )
    }

    /// Open capsule for voting after timestamp passes
    pub fn open_for_voting(ctx: Context<OpenForVoting>) -> Result<()> {
        instructions::open_for_voting::handler(ctx)
    }

    /// Cast a vote on an open capsule
    pub fn cast_vote(ctx: Context<CastVote>, vote: bool) -> Result<()> {
        instructions::cast_vote::handler(ctx, vote)
    }

    /// Resolve capsule after voting period ends
    pub fn resolve_capsule(ctx: Context<ResolveCapsule>) -> Result<()> {
        instructions::resolve_capsule::handler(ctx)
    }

    /// Claim stake from escrow after resolution
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    /// Cancel capsule before it opens (creator only)
    pub fn cancel_capsule(ctx: Context<CancelCapsule>) -> Result<()> {
        instructions::cancel_capsule::handler(ctx)
    }

    pub fn add_stake(
        ctx: Context<AddStake>,
        amount: u64,
        stake_destination: state::StakeDestination,
        destination_address: Option<Pubkey>,
    ) -> Result<()> {
        instructions::add_stake::handler(ctx, amount, stake_destination, destination_address)
    }

    /// Close a capsule account and reclaim rent (creator only, after resolution/cancellation)
    pub fn close_capsule(ctx: Context<CloseCapsule>) -> Result<()> {
        instructions::close_capsule::handler(ctx)
    }
}
