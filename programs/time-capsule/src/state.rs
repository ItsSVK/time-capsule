use anchor_lang::prelude::*;

/// Capsule state - stores all information about a time capsule
#[account]
pub struct Capsule {
    /// Creator of the capsule (original owner)
    pub creator: Pubkey,
    /// Current owner of the NFT
    pub owner: Pubkey,
    /// NFT mint address
    pub nft_mint: Pubkey,
    /// URI pointing to metadata (IPFS)
    pub metadata_uri: String,
    /// Timestamp when capsule can be opened for voting
    pub open_timestamp: i64,
    /// Timestamp when voting period ends
    pub voting_end_timestamp: i64,
    /// Current status of the capsule
    pub status: CapsuleStatus,
    /// Number of yes votes
    pub yes_votes: u64,
    /// Number of no votes
    pub no_votes: u64,
    /// Minimum votes required for resolution
    pub quorum: u64,
    /// Optional stake amount
    pub stake_amount: u64,
    /// Mint of the staked token (System Program for SOL)
    pub stake_mint: Pubkey,
    /// Where stake goes on failure
    pub stake_destination: StakeDestination,
    /// Destination address for charity/community pool
    pub destination_address: Option<Pubkey>,
    /// Result after resolution
    pub result: Option<CapsuleResult>,
    /// Bump seed for PDA
    pub bump: u8,
}

impl Capsule {
    pub const MAX_URI_LENGTH: usize = 200;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // creator
        32 + // owner
        32 + // nft_mint
        (4 + Self::MAX_URI_LENGTH) + // metadata_uri
        8 + // open_timestamp
        8 + // voting_end_timestamp
        1 + // status
        8 + // yes_votes
        8 + // no_votes
        8 + // quorum
        8 + // stake_amount
        32 + // stake_mint
        1 + // stake_destination
        (1 + 32) + // destination_address (Option)
        (1 + 1) + // result (Option)
        1; // bump
}

/// Escrow account holding staked tokens
#[account]
pub struct Escrow {
    /// Associated capsule
    pub capsule: Pubkey,
    /// Amount held in escrow
    pub amount: u64,
    /// Token mint
    pub mint: Pubkey,
    /// Bump seed
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + // discriminator
        32 + // capsule
        8 + // amount
        32 + // mint
        1; // bump
}

/// Voter record to prevent double voting
#[account]
pub struct VoterRecord {
    /// Capsule being voted on
    pub capsule: Pubkey,
    /// Voter's wallet
    pub voter: Pubkey,
    /// Vote cast (true = yes, false = no)
    pub vote: bool,
    /// Timestamp of vote
    pub timestamp: i64,
    /// Bump seed
    pub bump: u8,
}

impl VoterRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // capsule
        32 + // voter
        1 + // vote
        8 + // timestamp
        1; // bump
}

/// Capsule lifecycle status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CapsuleStatus {
    /// Capsule is active, waiting for open_timestamp
    Active,
    /// Capsule is open for voting
    OpenForVoting,
    /// Capsule has been resolved
    Resolved,
    /// Capsule was cancelled by creator
    Cancelled,
}

/// Where stake goes on failure
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum StakeDestination {
    /// Burned/sent to community pool
    CommunityPool,
    /// Sent to charity address
    Charity,
    /// Distributed to voters
    TopVoters,
    /// Returned to creator (for no-stake capsules)
    ReturnToCreator,
}

/// Result of capsule resolution
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CapsuleResult {
    /// Capsule goal was achieved (majority yes)
    Success,
    /// Capsule goal was not achieved (majority no)
    Failure,
}
