import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export enum CapsuleStatus {
  Active = 'active',
  OpenForVoting = 'openForVoting',
  Resolved = 'resolved',
  Cancelled = 'cancelled',
}

export enum CapsuleResult {
  Success = 'success',
  Failure = 'failure',
}

export enum StakeDestination {
  CommunityPool = 'communityPool',
  Charity = 'charity',
  ReturnToCreator = 'returnToCreator',
}

export interface CapsuleAccount {
  creator: PublicKey;
  owner: PublicKey;
  nftMint: PublicKey;
  metadataUri: string;
  openTimestamp: BN;
  votingEndTimestamp: BN;
  votingDuration: BN;
  status: { [key in CapsuleStatus]?: Record<string, never> };
  yesVotes: BN;
  noVotes: BN;
  quorum: BN;
  stakeAmount: BN;
  stakeMint: PublicKey;
  stakeDestination: { [key in StakeDestination]?: Record<string, never> };
  destinationAddress: PublicKey | null;
  result: { [key in CapsuleResult]?: Record<string, never> } | null;
  bump: number;
}

export interface EscrowAccount {
  capsule: PublicKey;
  amount: BN;
  mint: PublicKey;
  bump: number;
}

export interface VoterRecordAccount {
  capsule: PublicKey;
  voter: PublicKey;
  vote: boolean;
  timestamp: BN;
  bump: number;
}

// Metadata stored on IPFS
export interface CapsuleMetadata {
  name: string;
  description: string;
  image?: string;
  category: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Parsed capsule for UI display
export interface ParsedCapsule {
  publicKey: PublicKey;
  account: CapsuleAccount;
  metadata?: CapsuleMetadata;
  status: CapsuleStatus;
  result?: CapsuleResult;
  stakeDestination: StakeDestination;
  timeRemaining: number; // seconds until open
  votingTimeRemaining: number; // seconds until voting ends
  totalVotes: number;
  yesPercentage: number;
}

export function getCapsuleStatus(account: CapsuleAccount): CapsuleStatus {
  if (account.status.active !== undefined) return CapsuleStatus.Active;
  if (account.status.openForVoting !== undefined)
    return CapsuleStatus.OpenForVoting;
  if (account.status.resolved !== undefined) return CapsuleStatus.Resolved;
  if (account.status.cancelled !== undefined) return CapsuleStatus.Cancelled;
  return CapsuleStatus.Active;
}

export function getCapsuleResult(
  account: CapsuleAccount
): CapsuleResult | undefined {
  if (!account.result) return undefined;
  if (account.result.success !== undefined) return CapsuleResult.Success;
  if (account.result.failure !== undefined) return CapsuleResult.Failure;
  return undefined;
}

export function getStakeDestination(account: CapsuleAccount): StakeDestination {
  if (account.stakeDestination.communityPool !== undefined)
    return StakeDestination.CommunityPool;
  if (account.stakeDestination.charity !== undefined)
    return StakeDestination.Charity;
  return StakeDestination.ReturnToCreator;
}
