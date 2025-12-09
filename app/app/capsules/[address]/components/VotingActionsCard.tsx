'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Trophy,
  Coins,
  Sparkles,
  Wallet,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CapsuleStatus,
  CapsuleResult,
  ParsedCapsule,
} from '@/lib/solana/types';
import { cardVariants } from '../constants';
import VotingProgress from './VotingProgress';

interface VotingActionsCardProps {
  capsule: ParsedCapsule;
  isCreator: boolean;
  publicKey: any;
  hasVoted: boolean;
  voterRecord: any;
  canOpenForVoting: boolean;
  canVote: boolean;
  canResolve: boolean;
  realVotingTimeRemaining: number;
  refetching?: boolean;
  stakeClaimInfo: {
    canClaimStake: boolean;
    stakeAmount: number;
    message: string;
    buttonText: string;
  } | null;
  onOpenForVoting: () => Promise<void>;
  onVote: (vote: boolean) => Promise<void>;
  onResolve: () => Promise<void>;
  onClaimStake: () => Promise<void>;
}

export default function VotingActionsCard({
  capsule,
  isCreator,
  publicKey,
  hasVoted,
  voterRecord,
  canOpenForVoting,
  canVote,
  canResolve,
  realVotingTimeRemaining,
  refetching = false,
  stakeClaimInfo,
  onOpenForVoting,
  onVote,
  onResolve,
  onClaimStake,
}: VotingActionsCardProps) {
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [loadingVote, setLoadingVote] = useState<'yes' | 'no' | null>(null);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const showCard =
    capsule.status === CapsuleStatus.OpenForVoting ||
    capsule.status === CapsuleStatus.Resolved ||
    canOpenForVoting;

  if (!showCard) return null;

  const handleOpenForVoting = async () => {
    setLoadingOpen(true);
    try {
      await onOpenForVoting();
    } finally {
      setLoadingOpen(false);
    }
  };

  const handleVote = async (vote: boolean) => {
    setLoadingVote(vote ? 'yes' : 'no');
    try {
      await onVote(vote);
    } finally {
      setLoadingVote(null);
    }
  };

  const handleResolve = async () => {
    setLoadingResolve(true);
    try {
      await onResolve();
    } finally {
      setLoadingResolve(false);
    }
  };

  const handleClaimStake = async () => {
    setLoadingClaim(true);
    try {
      await onClaimStake();
    } finally {
      setLoadingClaim(false);
    }
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className="border-2 border-purple-500/30 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-pink-500/5 to-violet-500/5" />

        {/* Header */}
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Vote className="h-5 w-5 text-purple-500" />
              </div>
              {capsule.status === CapsuleStatus.Resolved
                ? 'Final Results'
                : capsule.status === CapsuleStatus.OpenForVoting
                ? 'Cast Your Vote'
                : 'Ready to Open'}
            </CardTitle>
            {capsule.status === CapsuleStatus.OpenForVoting && (
              <motion.div
                className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs font-medium text-purple-400">
                  🔴 LIVE
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Refetching overlay */}
          {refetching && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Updating...</p>
              </div>
            </div>
          )}

          {/* Voting Progress - Show when voting or resolved */}
          {(capsule.status === CapsuleStatus.OpenForVoting ||
            capsule.status === CapsuleStatus.Resolved) && (
            <div className="space-y-6">
              <VotingProgress
                yesVotes={capsule.account.yesVotes.toNumber()}
                noVotes={capsule.account.noVotes.toNumber()}
                quorum={capsule.account.quorum.toNumber()}
              />

              {/* Already Voted Indicator */}
              {hasVoted && voterRecord && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${
                    voterRecord.vote
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <CheckCircle
                    className={`h-5 w-5 ${
                      voterRecord.vote ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      voterRecord.vote ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    You voted {voterRecord.vote ? 'Yes' : 'No'}
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Open for Voting Button */}
            <AnimatePresence mode="wait">
              {canOpenForVoting && isCreator && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button
                    onClick={handleOpenForVoting}
                    disabled={loadingOpen}
                    size="lg"
                    className="w-full h-14 text-lg gap-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/20 dark:text-white disabled:opacity-70"
                  >
                    {loadingOpen ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing transaction...
                      </>
                    ) : (
                      <>
                        <Vote className="h-5 w-5" />
                        Open for Voting
                        <Sparkles className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voting Buttons */}
            {capsule.status === CapsuleStatus.OpenForVoting &&
              realVotingTimeRemaining > 0 && (
                <>
                  {!publicKey && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center"
                    >
                      <Wallet className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-amber-500">
                        Connect your wallet to vote
                      </p>
                    </motion.div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={!hasVoted && publicKey ? { scale: 1.02 } : {}}
                      whileTap={!hasVoted && publicKey ? { scale: 0.98 } : {}}
                      className="relative group"
                    >
                      <Button
                        onClick={() => {
                          if (!publicKey) {
                            toast.error('Please connect your wallet to vote');
                            return;
                          }
                          handleVote(true);
                        }}
                        disabled={
                          hasVoted || !publicKey || loadingVote !== null
                        }
                        size="lg"
                        className={`w-full h-16 text-lg gap-3 transition-all text-white ${
                          hasVoted || !publicKey || loadingVote !== null
                            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : 'bg-linear-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-md shadow-green-500/20'
                        } disabled:opacity-70`}
                      >
                        {loadingVote === 'yes' ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Signing transaction...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-6 w-6" />
                            Vote Yes
                          </>
                        )}
                      </Button>
                      {hasVoted && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                          <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                            Already voted
                          </span>
                        </div>
                      )}
                      {!publicKey && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                          <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                            Connect wallet
                          </span>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      whileHover={!hasVoted && publicKey ? { scale: 1.02 } : {}}
                      whileTap={!hasVoted && publicKey ? { scale: 0.98 } : {}}
                      className="relative group"
                    >
                      <Button
                        onClick={() => {
                          if (!publicKey) {
                            toast.error('Please connect your wallet to vote');
                            return;
                          }
                          handleVote(false);
                        }}
                        disabled={
                          hasVoted || !publicKey || loadingVote !== null
                        }
                        size="lg"
                        className={`w-full h-16 text-lg gap-3 transition-all ${
                          hasVoted || !publicKey || loadingVote !== null
                            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : 'bg-linear-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 shadow-md shadow-red-500/20'
                        } disabled:opacity-70`}
                      >
                        {loadingVote === 'no' ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Signing transaction...
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-6 w-6" />
                            Vote No
                          </>
                        )}
                      </Button>
                      {hasVoted && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                          <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                            Already voted
                          </span>
                        </div>
                      )}
                      {!publicKey && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                          <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                            Connect wallet
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </>
              )}

            {/* Resolve Button */}
            <AnimatePresence mode="wait">
              {canResolve && isCreator && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button
                    onClick={handleResolve}
                    disabled={loadingResolve}
                    size="lg"
                    className="w-full h-14 text-lg gap-3 bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-md shadow-violet-500/20 dark:text-white hover:text-white disabled:opacity-70"
                  >
                    {loadingResolve ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing transaction...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Resolve Capsule
                        <Trophy className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Claim Stake Section */}
            {capsule.status === CapsuleStatus.Resolved &&
              stakeClaimInfo &&
              stakeClaimInfo.stakeAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  {/* Stake info message */}
                  <div
                    className={`text-center p-3 rounded-xl ${
                      capsule.result === CapsuleResult.Success
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-amber-500/10 border border-amber-500/30'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        capsule.result === CapsuleResult.Success
                          ? 'text-green-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {stakeClaimInfo.message}
                    </p>
                  </div>

                  {/* Claim button - only show if user can claim */}
                  {stakeClaimInfo.canClaimStake && (
                    <Button
                      onClick={handleClaimStake}
                      disabled={loadingClaim}
                      size="lg"
                      className={`w-full h-14 text-lg gap-3 shadow-md dark:text-white disabled:opacity-70 ${
                        capsule.result === CapsuleResult.Success
                          ? 'bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-green-500/20'
                          : 'bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-500/20'
                      }`}
                    >
                      {loadingClaim ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Signing transaction...
                        </>
                      ) : (
                        <>
                          <Coins className="h-5 w-5" />
                          {stakeClaimInfo.buttonText} (
                          {stakeClaimInfo.stakeAmount.toFixed(4)} SOL)
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              )}

            {/* Voting Ended Message */}
            {capsule.status === CapsuleStatus.OpenForVoting &&
              realVotingTimeRemaining === 0 &&
              !isCreator && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 rounded-xl bg-muted/30 border border-border/30"
                >
                  <p className="text-muted-foreground">
                    Voting has ended. Waiting for creator to resolve.
                  </p>
                </motion.div>
              )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
