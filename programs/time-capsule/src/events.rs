use anchor_lang::prelude::*;

/// Emitted when a new capsule is created
#[event]
pub struct CapsuleCreated {
    pub capsule: Pubkey,
    pub creator: Pubkey,
    pub nft_mint: Pubkey,
    pub open_timestamp: i64,
    pub stake_amount: u64,
    pub metadata_uri: String,
}

/// Emitted when a capsule is opened for voting
#[event]
pub struct CapsuleOpened {
    pub capsule: Pubkey,
    pub opened_at: i64,
}

/// Emitted when a vote is cast
#[event]
pub struct VoteCast {
    pub capsule: Pubkey,
    pub voter: Pubkey,
    pub vote: bool, // true = yes, false = no
    pub yes_votes: u64,
    pub no_votes: u64,
}

/// Emitted when a capsule is resolved
#[event]
pub struct CapsuleResolved {
    pub capsule: Pubkey,
    pub result: bool, // true = success, false = failure
    pub yes_votes: u64,
    pub no_votes: u64,
    pub resolved_at: i64,
}

/// Emitted when stake is claimed
#[event]
pub struct StakeClaimed {
    pub capsule: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

/// Emitted when a capsule is cancelled
#[event]
pub struct CapsuleCancelled {
    pub capsule: Pubkey,
    pub creator: Pubkey,
    pub cancelled_at: i64,
}

/// Emitted when a capsule account is closed
#[event]
pub struct CapsuleClosed {
    pub capsule: Pubkey,
    pub creator: Pubkey,
    pub closed_at: i64,
}
