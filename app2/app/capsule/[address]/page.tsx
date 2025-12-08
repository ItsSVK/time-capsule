'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import BackgroundGradients from '@/app/create/components/BackgroundGradients';
import { Card, CardContent } from '@/components/ui/card';
import { useCapsule } from '@/hooks/useCapsule';
import { useCapsuleActions } from '@/hooks/useCapsules';
import { useVoterStatus } from '@/hooks/useVoterStatus';
import { CapsuleStatus } from '@/lib/solana/types';
import { Spinner } from '@/components/kibo-ui/spinner';
import { cardVariants } from './constants';
import { useCapsuleTimers } from './hooks/useCapsuleTimers';
import { useCapsulePermissions } from './hooks/useCapsulePermissions';
import { useStakeClaimInfo } from './hooks/useStakeClaimInfo';
import HeroSection from './components/HeroSection';
import CountdownTimerCard from './components/CountdownTimerCard';
import VotingTimerCard from './components/VotingTimerCard';
import VotingActionsCard from './components/VotingActionsCard';
import CreatorCard from './components/CreatorCard';
import ScheduleCard from './components/ScheduleCard';
import VotingSettingsCard from './components/VotingSettingsCard';
import StakeCard from './components/StakeCard';
import AddressCard from './components/AddressCard';
import ConfirmationModal from './components/ConfirmationModal';

export default function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const { publicKey } = useWallet();
  const { capsule, loading, refetching, error, refetch } = useCapsule(address);
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

  // Use custom hooks
  const { realTimeRemaining, realVotingTimeRemaining } =
    useCapsuleTimers(capsule);

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

  // Get permissions
  const {
    isCreator,
    canOpenForVoting,
    canVote,
    canResolve,
    canCancel,
    canClose,
  } = useCapsulePermissions(
    capsule,
    publicKey,
    realTimeRemaining,
    realVotingTimeRemaining,
    hasVoted
  );

  // Get stake claim info
  const stakeClaimInfo = useStakeClaimInfo(
    capsule,
    publicKey,
    isCreator || false,
    hasVoted
  );

  const hasStake = capsule ? capsule.account.stakeAmount.toNumber() > 0 : false;
  const stakeAmount = capsule
    ? capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL
    : 0;

  // Handlers
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
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="relative z-10">
          <Card className="border-2 border-destructive/30 shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Capsule Not Found</h2>
              <p className="text-muted-foreground">
                {error || "The capsule you're looking for doesn't exist."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative">
      <BackgroundGradients />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Hero Section */}
        <motion.div variants={cardVariants}>
          <HeroSection
            capsule={capsule}
            isCreator={!!isCreator}
            canCancel={canCancel}
            canClose={canClose}
            onCancelClick={() => setShowCancelModal(true)}
            onCloseClick={() => setShowCloseModal(true)}
            onCopyAddress={copyAddress}
          />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Time & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown Timer Card */}
            {capsule.status === CapsuleStatus.Active && (
              <CountdownTimerCard
                capsule={capsule}
                realTimeRemaining={realTimeRemaining}
              />
            )}

            {/* Voting Timer Card */}
            {capsule.status === CapsuleStatus.OpenForVoting && (
              <VotingTimerCard
                capsule={capsule}
                realVotingTimeRemaining={realVotingTimeRemaining}
              />
            )}

            {/* Voting & Actions Card */}
            <VotingActionsCard
              capsule={capsule}
              isCreator={!!isCreator}
              publicKey={publicKey}
              hasVoted={hasVoted}
              voterRecord={voterRecord}
              canOpenForVoting={canOpenForVoting}
              canVote={canVote}
              canResolve={canResolve}
              realVotingTimeRemaining={realVotingTimeRemaining}
              refetching={refetching}
              stakeClaimInfo={stakeClaimInfo}
              onOpenForVoting={handleOpenForVoting}
              onVote={handleVote}
              onResolve={handleResolve}
              onClaimStake={handleClaimStake}
            />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <motion.div variants={cardVariants}>
              <CreatorCard
                capsule={capsule}
                isCreator={!!isCreator}
                onCopyAddress={copyAddress}
              />
            </motion.div>

            <motion.div variants={cardVariants}>
              <ScheduleCard capsule={capsule} />
            </motion.div>

            <motion.div variants={cardVariants}>
              <VotingSettingsCard capsule={capsule} />
            </motion.div>

            {hasStake && (
              <motion.div variants={cardVariants}>
                <StakeCard
                  capsule={capsule}
                  stakeAmount={stakeAmount}
                  canClaimStake={stakeClaimInfo?.canClaimStake || false}
                />
              </motion.div>
            )}

            <motion.div variants={cardVariants}>
              <AddressCard capsule={capsule} address={address} />
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
