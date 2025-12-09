import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  CapsuleResult,
  StakeDestination,
  ParsedCapsule,
  CapsuleStatus,
} from '@/lib/solana/types';

export function useStakeClaimInfo(
  capsule: ParsedCapsule | null,
  publicKey: PublicKey | null,
  isCreator: boolean,
  hasVoted: boolean
) {
  if (!capsule) return null;

  const hasStake = capsule.account.stakeAmount.toNumber() > 0;
  const stakeAmount = capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL;

  if (
    !hasStake ||
    capsule.status !== CapsuleStatus.Resolved ||
    !capsule.result
  ) {
    return null;
  }

  const result = capsule.result;
  const destination = capsule.stakeDestination;

  // Determine who can claim
  const canClaimStake = (() => {
    // Success: stake returns to creator (they achieved their goal!)
    if (result === CapsuleResult.Success) {
      return isCreator;
    }

    // Failure: stake goes to configured destination
    if (result === CapsuleResult.Failure) {
      switch (destination) {
        case StakeDestination.ReturnToCreator:
          return isCreator;
        case StakeDestination.Charity:
        case StakeDestination.CommunityPool:
          // Destination address holder can claim
          return (
            publicKey &&
            capsule.account.destinationAddress &&
            capsule.account.destinationAddress.equals(publicKey)
          );
        default:
          return false;
      }
    }

    return false;
  })();

  // Get claim info message
  const getInfo = () => {
    if (result === CapsuleResult.Success) {
      return {
        canClaim: isCreator,
        message: isCreator
          ? '🎉 Congratulations! Claim your stake back.'
          : 'Creator can claim stake (goal achieved!)',
        buttonText: 'Claim Stake',
      };
    }

    if (result === CapsuleResult.Failure) {
      switch (destination) {
        case StakeDestination.ReturnToCreator:
          return {
            canClaim: isCreator,
            message: isCreator
              ? 'Claim your stake back'
              : 'Stake returns to creator',
            buttonText: 'Claim Stake',
          };
        case StakeDestination.Charity:
          return {
            canClaim:
              publicKey &&
              capsule.account.destinationAddress?.equals(publicKey),
            message: 'Stake goes to charity',
            buttonText: 'Claim for Charity',
          };
        case StakeDestination.CommunityPool:
          return {
            canClaim:
              publicKey &&
              capsule.account.destinationAddress?.equals(publicKey),
            message: 'Stake goes to community pool',
            buttonText: 'Claim for Community',
          };
      }
    }
    return null;
  };

  const info = getInfo();

  if (!info) {
    return null;
  }

  return {
    canClaimStake: canClaimStake || false,
    stakeAmount,
    hasStake,
    message: info.message,
    buttonText: info.buttonText,
  };
}
