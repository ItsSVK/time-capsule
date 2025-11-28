use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("CdnFqzmdDY1ArXRz1QbFbU1CtceN7xsz3mftJyosjM9u");

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
    ) -> Result<()> {
        instructions::initialize_capsule::handler(
            ctx,
            metadata_uri,
            open_timestamp,
            voting_duration,
            quorum,
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
}
