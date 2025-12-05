'use client';

import { use, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  Image as ImageIcon,
  Tag,
  Lock,
  Coins,
  ArrowRight,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  User,
  Timer,
  Hourglass,
  Trophy,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  Trash2,
  Ban,
} from 'lucide-react';
import BackgroundGradients from '@/app/create/components/BackgroundGradients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCapsule } from '@/hooks/useCapsule';
import { useCapsuleActions } from '@/hooks/useCapsules';
import { useVoterStatus } from '@/hooks/useVoterStatus';
import {
  CapsuleStatus,
  CapsuleResult,
  StakeDestination,
} from '@/lib/solana/types';
import { VOTING_DURATION_OPTIONS } from '@/lib/solana/constants';
import { Spinner } from '@/components/kibo-ui/spinner';
import AnimatedHourglass from './components/AnimatedHourglass';
import ConfirmationModal from './components/ConfirmationModal';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const numberVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Helper functions
function formatVotingDuration(seconds: number): string {
  const option = VOTING_DURATION_OPTIONS.find(opt => opt.value === seconds);
  return option ? option.label : `${seconds} seconds`;
}

function formatStakeDestination(destination: StakeDestination): string {
  const labels: Record<StakeDestination, string> = {
    [StakeDestination.CommunityPool]: 'Community Pool',
    [StakeDestination.Charity]: 'Charity',
    [StakeDestination.TopVoters]: 'Top Voters',
    [StakeDestination.ReturnToCreator]: 'Return to Creator',
  };
  return labels[destination] || destination;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Countdown Timer Component
function CountdownTimer({ targetTimestamp }: { targetTimestamp: number }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  if (isExpired) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2 text-green-500"
      >
        <CheckCircle className="h-6 w-6" />
        <span className="text-xl font-bold">Ready to Open!</span>
      </motion.div>
    );
  }

  const TimeUnit = ({
    value,
    label,
    color,
  }: {
    value: number;
    label: string;
    color: string;
  }) => (
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
    >
      <div
        className={`relative w-20 h-20 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg border border-white/10`}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            variants={numberVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm" />
      </div>
      <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-medium">
        {label}
      </span>
    </motion.div>
  );

  return (
    <div className="flex items-center justify-center gap-3">
      <TimeUnit
        value={timeLeft.days}
        label="Days"
        color="from-blue-600 to-blue-800"
      />
      <span className="text-3xl font-bold text-muted-foreground/50 mt-[-20px]">
        :
      </span>
      <TimeUnit
        value={timeLeft.hours}
        label="Hours"
        color="from-purple-600 to-purple-800"
      />
      <span className="text-3xl font-bold text-muted-foreground/50 mt-[-20px]">
        :
      </span>
      <TimeUnit
        value={timeLeft.minutes}
        label="Minutes"
        color="from-pink-600 to-pink-800"
      />
      <span className="text-3xl font-bold text-muted-foreground/50 mt-[-20px]">
        :
      </span>
      <TimeUnit
        value={timeLeft.seconds}
        label="Seconds"
        color="from-amber-600 to-amber-800"
      />
    </div>
  );
}

// Voting Progress Component
function VotingProgress({
  yesVotes,
  noVotes,
  quorum,
}: {
  yesVotes: number;
  noVotes: number;
  quorum: number;
}) {
  const total = yesVotes + noVotes;
  const yesPercentage = total > 0 ? (yesVotes / total) * 100 : 50;
  const noPercentage = total > 0 ? (noVotes / total) * 100 : 50;
  const quorumProgress = Math.min((total / quorum) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Vote Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-green-500">Yes</span>
          </div>
          <span className="text-lg font-bold">{yesVotes}</span>
        </div>
        <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yesPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="absolute left-0 top-0 h-full bg-linear-to-r from-green-500 to-emerald-400 rounded-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${noPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="absolute right-0 top-0 h-full bg-linear-to-l from-red-500 to-rose-400 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-red-500">No</span>
          </div>
          <span className="text-lg font-bold">{noVotes}</span>
        </div>
      </div>

      {/* Quorum Progress */}
      <div className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Quorum Progress</span>
          <span className="text-sm font-medium">
            {total} / {quorum} votes
          </span>
        </div>
        <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${quorumProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
        {quorumProgress >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-green-500 text-sm mt-2"
          >
            <CheckCircle className="h-4 w-4" />
            Quorum reached!
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const { publicKey } = useWallet();
  const { capsule, loading, error, refetch } = useCapsule(address);
  const {
    openForVoting,
    castVote,
    resolveCapsule,
    claimStake,
    cancelCapsule,
    closeCapsule,
  } = useCapsuleActions();
  const {
    hasVoted,
    voterRecord,
    refetch: refetchVoterStatus,
  } = useVoterStatus(address);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Real-time state tracking
  const [realTimeRemaining, setRealTimeRemaining] = useState(0);
  const [realVotingTimeRemaining, setRealVotingTimeRemaining] = useState(0);

  // Real-time updates effect
  useEffect(() => {
    if (!capsule) return;

    const updateTimes = () => {
      const now = Math.floor(Date.now() / 1000);
      const openTimestamp = capsule.account.openTimestamp.toNumber();
      const votingEndTimestamp = capsule.account.votingEndTimestamp.toNumber();

      setRealTimeRemaining(Math.max(0, openTimestamp - now));
      setRealVotingTimeRemaining(Math.max(0, votingEndTimestamp - now));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [capsule]);

  // Auto-refetch when state should change
  useEffect(() => {
    if (!capsule) return;

    // When unlock time reaches 0 and status is still Active
    if (
      realTimeRemaining === 0 &&
      capsule.status === CapsuleStatus.Active &&
      capsule.timeRemaining > 0
    ) {
      refetch();
    }

    // When voting time reaches 0 and status is still OpenForVoting
    if (
      realVotingTimeRemaining === 0 &&
      capsule.status === CapsuleStatus.OpenForVoting &&
      capsule.votingTimeRemaining > 0
    ) {
      refetch();
    }
  }, [realTimeRemaining, realVotingTimeRemaining, capsule, refetch]);

  const isCreator = publicKey && capsule?.account.creator.equals(publicKey);
  const hasStake = capsule ? capsule.account.stakeAmount.toNumber() > 0 : false;
  const stakeAmount = capsule
    ? capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL
    : 0;

  // Use real-time values for button visibility
  const canOpenForVoting =
    capsule?.status === CapsuleStatus.Active && realTimeRemaining === 0;
  const canVote =
    capsule?.status === CapsuleStatus.OpenForVoting &&
    realVotingTimeRemaining > 0 &&
    !hasVoted;
  const canResolve =
    capsule?.status === CapsuleStatus.OpenForVoting &&
    realVotingTimeRemaining === 0;
  const canCancel = isCreator && capsule?.status === CapsuleStatus.Active;
  const canClose =
    isCreator &&
    (capsule?.status === CapsuleStatus.Resolved ||
      capsule?.status === CapsuleStatus.Cancelled);

  // Stake claiming logic - determine who can claim based on result and stake destination
  const canClaimStake = (() => {
    if (!capsule || !hasStake || capsule.status !== CapsuleStatus.Resolved)
      return false;

    const result = capsule.result;
    const destination = capsule.stakeDestination;

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
        case StakeDestination.TopVoters:
          // For now, allow any voter to check (would need more complex logic for top voters)
          return hasVoted;
        default:
          return false;
      }
    }

    return false;
  })();

  // Get claim stake message based on who can claim
  const getStakeClaimInfo = () => {
    if (!capsule || !hasStake || capsule.status !== CapsuleStatus.Resolved)
      return null;

    const result = capsule.result;
    const destination = capsule.stakeDestination;

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
        case StakeDestination.TopVoters:
          return {
            canClaim: hasVoted, // Simplified - actual implementation would be more complex
            message: 'Stake distributed to top voters',
            buttonText: 'Claim Voter Reward',
          };
      }
    }
    return null;
  };

  const stakeClaimInfo = getStakeClaimInfo();

  const handleOpenForVoting = async () => {
    if (!capsule) return;
    try {
      await openForVoting(capsule.publicKey);
      toast.success('Capsule opened for voting!');
      await refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to open for voting'
      );
    }
  };

  const handleVote = async (vote: boolean) => {
    if (!capsule) return;
    try {
      await castVote(capsule.publicKey, vote);
      toast.success(`Vote ${vote ? 'Yes' : 'No'} recorded!`);
      await Promise.all([refetch(), refetchVoterStatus()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cast vote');
    }
  };

  const handleResolve = async () => {
    if (!capsule) return;
    try {
      await resolveCapsule(capsule.publicKey);
      toast.success('Capsule resolved!');
      await refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to resolve capsule'
      );
    }
  };

  const handleClaimStake = async () => {
    if (!capsule) return;
    try {
      await claimStake(capsule.publicKey);
      toast.success('Stake claimed!');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to claim stake');
    }
  };

  const handleCancelCapsule = async () => {
    if (!capsule) return;
    await cancelCapsule(capsule.publicKey);
    toast.success('Capsule cancelled successfully!');
    await refetch();
  };

  const handleCloseCapsule = async () => {
    if (!capsule) return;
    await closeCapsule(capsule.publicKey);
    toast.success('Capsule closed! Rent reclaimed.');
    // Redirect to home since capsule no longer exists
    window.location.href = '/';
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Spinner variant="throbber" className="size-10" />
          <p className="text-muted-foreground">Loading capsule...</p>
        </div>
      </div>
    );
  }

  if (error || !capsule) {
    const isWalletError = error?.includes('connect your wallet');
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="relative z-10">
          <Card
            className={`border-2 ${
              isWalletError ? 'border-amber-500/30' : 'border-destructive/30'
            } shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full`}
          >
            <CardContent className="pt-8 pb-8 text-center">
              {isWalletError ? (
                <>
                  <Wallet className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">
                    Connect Your Wallet
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to view this time capsule.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the wallet button in the top right corner to connect.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Capsule Not Found</h2>
                  <p className="text-muted-foreground">
                    {error || "The capsule you're looking for doesn't exist."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metadata = capsule.metadata;
  const statusConfig = {
    [CapsuleStatus.Active]: {
      color: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      icon: Lock,
      label: 'Locked',
    },
    [CapsuleStatus.OpenForVoting]: {
      color: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      icon: Vote,
      label: 'Voting Open',
    },
    [CapsuleStatus.Resolved]: {
      color: 'from-green-500/20 to-green-600/10',
      border: 'border-green-500/30',
      text: 'text-green-500',
      icon: CheckCircle,
      label: 'Resolved',
    },
    [CapsuleStatus.Cancelled]: {
      color: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      icon: XCircle,
      label: 'Cancelled',
    },
  };

  const status = statusConfig[capsule.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative">
      <BackgroundGradients />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Hero Section */}
        <motion.div variants={cardVariants}>
          <Card className="border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/95 overflow-hidden">
            <div className="relative">
              {/* Decorative gradient */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${status.color} opacity-50`}
              />

              <CardContent className="relative z-10 p-8">
                {/* Close/Cancel Button - Top Right */}
                {isCreator && (canCancel || canClose) && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500 text-amber-600"
                        onClick={() => setShowCancelModal(true)}
                      >
                        <Ban className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    )}
                    {canClose && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-600"
                        onClick={() => setShowCloseModal(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Close
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Image Section */}
                  {metadata?.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative shrink-0"
                    >
                      <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
                        <img
                          src={metadata.image}
                          alt={metadata.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-8 h-8 text-amber-400" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Info Section */}
                  <div className="flex-1 space-y-6">
                    {/* Status Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r ${status.color} ${status.border} border`}
                    >
                      <StatusIcon className={`h-4 w-4 ${status.text}`} />
                      <span className={`font-semibold ${status.text}`}>
                        {status.label}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl lg:text-5xl font-bold leading-tight"
                    >
                      {metadata?.name || 'Untitled Capsule'}
                    </motion.h1>

                    {/* Category & Tags */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-3 flex-wrap"
                    >
                      {metadata?.category && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Tag className="h-4 w-4" />
                          {metadata.category}
                        </span>
                      )}
                      {capsule.result && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${
                            capsule.result === CapsuleResult.Success
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          } border`}
                        >
                          <Trophy className="h-4 w-4" />
                          {capsule.result === CapsuleResult.Success
                            ? 'Success'
                            : 'Failed'}
                        </span>
                      )}
                    </motion.div>

                    {/* Description */}
                    {metadata?.description && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-foreground/70 leading-relaxed max-w-2xl"
                      >
                        {metadata.description}
                      </motion.p>
                    )}

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center gap-3 flex-wrap pt-2"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAddress(address)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Address
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/address/${address}?cluster=devnet`,
                            '_blank'
                          )
                        }
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Explorer
                      </Button>
                      {capsule.account.nftMint && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://explorer.solana.com/address/${capsule.account.nftMint.toBase58()}?cluster=devnet`,
                              '_blank'
                            )
                          }
                          className="gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View NFT
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Time & Creator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown Timer Card with Animated Hourglass */}
            {capsule.status === CapsuleStatus.Active && (
              <motion.div variants={cardVariants}>
                <Card
                  className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
                    realTimeRemaining === 0
                      ? 'border-green-500/30'
                      : 'border-amber-500/30'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      realTimeRemaining === 0
                        ? 'from-green-500/10 via-emerald-500/5 to-teal-500/5'
                        : 'from-amber-500/10 via-orange-500/5 to-purple-500/5'
                    }`}
                  />
                  <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            realTimeRemaining === 0
                              ? 'bg-green-500/20'
                              : 'bg-amber-500/20'
                          }`}
                        >
                          {realTimeRemaining === 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Timer className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                        {realTimeRemaining === 0
                          ? 'Ready to Open!'
                          : 'Time Until Unlock'}
                      </CardTitle>
                      {realTimeRemaining === 0 && (
                        <motion.div
                          className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <span className="text-xs font-medium text-green-400">
                            ✨ UNLOCKED
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-4 pb-8">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                      {/* Animated Hourglass */}
                      <AnimatedHourglass
                        targetTimestamp={capsule.account.openTimestamp.toNumber()}
                        size="lg"
                      />

                      {/* Additional Info */}
                      <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {realTimeRemaining === 0
                              ? 'Unlocked On'
                              : 'Unlock Date'}
                          </p>
                          <p className="text-xl font-semibold">
                            {new Date(
                              capsule.account.openTimestamp.toNumber() * 1000
                            ).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {realTimeRemaining === 0 ? 'At' : 'Unlock Time'}
                          </p>
                          <p className="text-xl font-semibold flex items-center gap-2">
                            <Clock
                              className={`h-5 w-5 ${
                                realTimeRemaining === 0
                                  ? 'text-green-500'
                                  : 'text-amber-500'
                              }`}
                            />
                            {new Date(
                              capsule.account.openTimestamp.toNumber() * 1000
                            ).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <AnimatePresence mode="wait">
                          {realTimeRemaining === 0 ? (
                            <motion.div
                              key="unlocked"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="mt-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
                            >
                              <p className="text-sm font-medium text-green-500">
                                🎉 Ready for voting!
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="locked"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="mt-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30"
                            >
                              <p className="text-sm font-medium text-amber-500">
                                ⏳ Capsule is locked
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Voting Timer Card */}
            {capsule.status === CapsuleStatus.OpenForVoting && (
              <motion.div variants={cardVariants}>
                <Card
                  className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
                    realVotingTimeRemaining === 0
                      ? 'border-violet-500/30'
                      : 'border-purple-500/30'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      realVotingTimeRemaining === 0
                        ? 'from-violet-500/10 via-purple-500/5 to-indigo-500/5'
                        : 'from-purple-500/10 via-pink-500/5 to-violet-500/5'
                    }`}
                  />
                  <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            realVotingTimeRemaining === 0
                              ? 'bg-violet-500/20'
                              : 'bg-purple-500/20'
                          }`}
                        >
                          {realVotingTimeRemaining === 0 ? (
                            <Hourglass className="h-5 w-5 text-violet-500" />
                          ) : (
                            <Vote className="h-5 w-5 text-purple-500" />
                          )}
                        </div>
                        {realVotingTimeRemaining === 0
                          ? 'Voting Ended'
                          : 'Voting Period'}
                      </CardTitle>
                      {realVotingTimeRemaining > 0 && (
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
                  <CardContent className="relative z-10 pt-4 pb-8">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                      {/* Animated Hourglass for voting */}
                      <AnimatedHourglass
                        targetTimestamp={capsule.account.votingEndTimestamp.toNumber()}
                        createdTimestamp={capsule.account.openTimestamp.toNumber()}
                        size="md"
                      />

                      {/* Voting Info */}
                      <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {realVotingTimeRemaining === 0
                              ? 'Voting Ended'
                              : 'Voting Ends'}
                          </p>
                          <p className="text-lg font-semibold">
                            {new Date(
                              capsule.account.votingEndTimestamp.toNumber() *
                                1000
                            ).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Total Votes
                          </p>
                          <p className="text-2xl font-bold text-purple-500">
                            {capsule.totalVotes}
                          </p>
                        </div>
                        <AnimatePresence mode="wait">
                          {realVotingTimeRemaining === 0 ? (
                            <motion.div
                              key="ended"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30"
                            >
                              <p className="text-sm font-medium text-violet-500">
                                ⏰ Ready to resolve
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="active"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30"
                            >
                              <p className="text-sm font-medium text-purple-500">
                                🗳️ Voting is open!
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Voting & Actions Combined Card */}
            {(capsule.status === CapsuleStatus.OpenForVoting ||
              capsule.status === CapsuleStatus.Resolved ||
              canOpenForVoting) && (
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
                                voterRecord.vote
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                voterRecord.vote
                                  ? 'text-green-500'
                                  : 'text-red-500'
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
                              size="lg"
                              className="w-full h-14 text-lg gap-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
                            >
                              <Vote className="h-5 w-5" />
                              Open for Voting
                              <Sparkles className="h-4 w-4 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Voting Buttons */}
                      {capsule.status === CapsuleStatus.OpenForVoting &&
                        realVotingTimeRemaining > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div
                              whileHover={!hasVoted ? { scale: 1.02 } : {}}
                              whileTap={!hasVoted ? { scale: 0.98 } : {}}
                              className="relative group"
                            >
                              <Button
                                onClick={() => handleVote(true)}
                                disabled={hasVoted}
                                size="lg"
                                className={`w-full h-16 text-lg gap-3 transition-all ${
                                  hasVoted
                                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'bg-linear-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25'
                                }`}
                              >
                                <ThumbsUp className="h-6 w-6" />
                                Vote Yes
                              </Button>
                              {hasVoted && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                                  <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                                    Already voted
                                  </span>
                                </div>
                              )}
                            </motion.div>

                            <motion.div
                              whileHover={!hasVoted ? { scale: 1.02 } : {}}
                              whileTap={!hasVoted ? { scale: 0.98 } : {}}
                              className="relative group"
                            >
                              <Button
                                onClick={() => handleVote(false)}
                                disabled={hasVoted}
                                size="lg"
                                className={`w-full h-16 text-lg gap-3 transition-all ${
                                  hasVoted
                                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'bg-linear-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25'
                                }`}
                              >
                                <ThumbsDown className="h-6 w-6" />
                                Vote No
                              </Button>
                              {hasVoted && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md backdrop-blur-sm">
                                  <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-black/50">
                                    Already voted
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          </div>
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
                              size="lg"
                              className="w-full h-14 text-lg gap-3 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                            >
                              <CheckCircle className="h-5 w-5" />
                              Resolve Capsule
                              <Trophy className="h-4 w-4 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Claim Stake Section */}
                      {capsule.status === CapsuleStatus.Resolved &&
                        hasStake &&
                        stakeClaimInfo && (
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
                            {canClaimStake && (
                              <Button
                                onClick={handleClaimStake}
                                size="lg"
                                className={`w-full h-14 text-lg gap-3 shadow-lg ${
                                  capsule.result === CapsuleResult.Success
                                    ? 'bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                                    : 'bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25'
                                }`}
                              >
                                <Coins className="h-5 w-5" />
                                {stakeClaimInfo.buttonText} (
                                {stakeAmount.toFixed(4)} SOL)
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
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Creator Card */}
            <motion.div variants={cardVariants}>
              <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-cyan-500/20">
                      <User className="h-4 w-4 text-cyan-500" />
                    </div>
                    Creator
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">
                        {truncateAddress(capsule.account.creator.toBase58())}
                      </p>
                      {isCreator && (
                        <p className="text-xs text-primary">That's you!</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() =>
                      copyAddress(capsule.account.creator.toBase58())
                    }
                  >
                    <Copy className="h-3 w-3" />
                    Copy Creator Address
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Schedule Card */}
            <motion.div variants={cardVariants}>
              <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-blue-500/20">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Unlock Date
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        capsule.account.openTimestamp.toNumber() * 1000
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Unlock Time
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {new Date(
                        capsule.account.openTimestamp.toNumber() * 1000
                      ).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Voting Settings Card */}
            <motion.div variants={cardVariants}>
              <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-purple-500/20">
                      <Vote className="h-4 w-4 text-purple-500" />
                    </div>
                    Voting Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Voting Duration
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      {formatVotingDuration(
                        capsule.account.votingDuration.toNumber()
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Required Quorum
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {capsule.account.quorum.toNumber()} votes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stake Card */}
            {hasStake && (
              <motion.div variants={cardVariants}>
                <Card
                  className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
                    capsule.status === CapsuleStatus.Resolved
                      ? capsule.result === CapsuleResult.Success
                        ? 'border-green-500/30'
                        : 'border-amber-500/30'
                      : 'border-amber-500/30'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      capsule.status === CapsuleStatus.Resolved &&
                      capsule.result === CapsuleResult.Success
                        ? 'from-green-500/10 to-emerald-500/5'
                        : 'from-amber-500/10 to-orange-500/5'
                    }`}
                  />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div
                        className={`p-2 rounded-xl ${
                          capsule.status === CapsuleStatus.Resolved &&
                          capsule.result === CapsuleResult.Success
                            ? 'bg-green-500/20'
                            : 'bg-amber-500/20'
                        }`}
                      >
                        <Coins
                          className={`h-4 w-4 ${
                            capsule.status === CapsuleStatus.Resolved &&
                            capsule.result === CapsuleResult.Success
                              ? 'text-green-500'
                              : 'text-amber-500'
                          }`}
                        />
                      </div>
                      Stake Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Amount Staked
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          capsule.status === CapsuleStatus.Resolved &&
                          capsule.result === CapsuleResult.Success
                            ? 'text-green-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {stakeAmount.toFixed(4)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {capsule.status === CapsuleStatus.Resolved
                          ? 'Stake Goes To'
                          : 'If Failed, Goes To'}
                      </p>
                      <p className="font-semibold flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {capsule.status === CapsuleStatus.Resolved &&
                        capsule.result === CapsuleResult.Success
                          ? 'Creator (Goal Achieved!)'
                          : formatStakeDestination(capsule.stakeDestination)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {capsule.status === CapsuleStatus.Resolved && (
                      <div
                        className={`p-3 rounded-lg text-center ${
                          capsule.result === CapsuleResult.Success
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-amber-500/10 border border-amber-500/20'
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            capsule.result === CapsuleResult.Success
                              ? 'text-green-500'
                              : 'text-amber-500'
                          }`}
                        >
                          {capsule.result === CapsuleResult.Success
                            ? '✅ Goal Achieved - Stake Returnable'
                            : `⚡ Stake claimable by ${formatStakeDestination(
                                capsule.stakeDestination
                              )}`}
                        </p>
                      </div>
                    )}

                    {/* Who can claim info for non-creators */}
                    {capsule.status === CapsuleStatus.Resolved &&
                      !canClaimStake &&
                      hasStake && (
                        <p className="text-xs text-muted-foreground text-center">
                          You are not eligible to claim this stake
                        </p>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Address Card */}
            <motion.div variants={cardVariants}>
              <Card className="border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-gray-500/10 to-slate-500/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-xl bg-gray-500/20">
                      <Wallet className="h-4 w-4 text-gray-500" />
                    </div>
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Capsule PDA
                    </p>
                    <p className="font-mono text-xs truncate">{address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      NFT Mint
                    </p>
                    <p className="font-mono text-xs truncate">
                      {capsule.account.nftMint.toBase58()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelCapsule}
        type="cancel"
        capsuleName={capsule.metadata?.name}
      />
      <ConfirmationModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleCloseCapsule}
        type="close"
        capsuleName={capsule.metadata?.name}
      />
    </div>
  );
}
