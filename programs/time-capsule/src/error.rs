use anchor_lang::prelude::*;

#[error_code]
pub enum TimeCapsuleError {
    #[msg("Open timestamp must be in the future")]
    InvalidTimestamp,
    
    #[msg("Capsule is not yet ready to be opened")]
    CapsuleNotReady,
    
    #[msg("Capsule is not in the correct status for this operation")]
    InvalidStatus,
    
    #[msg("You have already voted on this capsule")]
    AlreadyVoted,
    
    #[msg("Voting period has not ended yet")]
    VotingPeriodNotEnded,
    
    #[msg("Quorum has not been reached")]
    QuorumNotReached,
    
    #[msg("Only the creator can perform this action")]
    Unauthorized,
    
    #[msg("Metadata URI is too long")]
    MetadataUriTooLong,
    
    #[msg("Invalid stake destination address")]
    InvalidDestinationAddress,
    
    #[msg("Capsule has not been resolved yet")]
    NotResolved,
    
    #[msg("No stake to claim")]
    NoStakeToClaim,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
