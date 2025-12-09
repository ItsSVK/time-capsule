import { PublicKey } from '@solana/web3.js';
import { CapsuleStatus, ParsedCapsule } from '@/lib/solana/types';

export function useCapsulePermissions(
  capsule: ParsedCapsule | null,
  publicKey: PublicKey | null,
  realTimeRemaining: number,
  realVotingTimeRemaining: number,
  hasVoted: boolean
) {
  if (!capsule) {
    return {
      isCreator: false,
      canOpenForVoting: false,
      canVote: false,
      canResolve: false,
      canCancel: false,
      canClose: false,
    };
  }

  const isCreator = !!(publicKey && capsule.account.creator.equals(publicKey));
  const canOpenForVoting =
    capsule.status === CapsuleStatus.Active && realTimeRemaining === 0;
  const canVote =
    capsule.status === CapsuleStatus.OpenForVoting &&
    realVotingTimeRemaining > 0 &&
    !hasVoted;
  const canResolve =
    capsule.status === CapsuleStatus.OpenForVoting &&
    realVotingTimeRemaining === 0;
  const canCancel = !!(isCreator && capsule.status === CapsuleStatus.Active);
  const canClose = !!(
    isCreator &&
    (capsule.status === CapsuleStatus.Resolved ||
      capsule.status === CapsuleStatus.Cancelled)
  );

  return {
    isCreator,
    canOpenForVoting,
    canVote,
    canResolve,
    canCancel,
    canClose,
  };
}

