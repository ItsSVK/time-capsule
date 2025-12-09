'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundGradients from '../create/components/BackgroundGradients';
import { useCapsules } from '@/hooks/useCapsules';
import { CapsuleStatus } from '@/lib/solana/types';
import CapsuleCardSkeleton from './components/CapsuleCardSkeleton';
import CapsuleCard from './components/CapsuleCard';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import CapsulesHeader from './components/CapsulesHeader';
import RefetchingIndicator from './components/RefetchingIndicator';
import { containerVariants } from './components/constants';

export default function Home() {
  const { capsules, loading, refetching, error } = useCapsules();
  const [realTimeRemaining, setRealTimeRemaining] = useState<
    Record<string, number>
  >({});

  // Update real-time countdowns
  useEffect(() => {
    const updateTimes = () => {
      const now = Math.floor(Date.now() / 1000);
      const times: Record<string, number> = {};

      capsules.forEach(capsule => {
        const address = capsule.publicKey.toBase58();
        if (capsule.status === CapsuleStatus.Active) {
          times[address] = Math.max(
            0,
            capsule.account.openTimestamp.toNumber() - now
          );
        } else if (capsule.status === CapsuleStatus.OpenForVoting) {
          times[address] = Math.max(
            0,
            capsule.account.votingEndTimestamp.toNumber() - now
          );
        } else {
          times[address] = 0;
        }
      });

      setRealTimeRemaining(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [capsules]);

  // Show skeleton cards during initial loading
  const showSkeletons = loading && capsules.length === 0;

  if (error) {
    return <ErrorState error={error} />;
  }

  // Show "No Capsules Yet" only when NOT loading and no capsules
  const showEmptyState = !loading && capsules.length === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative">
      <BackgroundGradients />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Always show */}
        <CapsulesHeader />

        {/* Empty State - Only show when NOT loading and no capsules */}
        {showEmptyState && <EmptyState />}

        {/* Capsules Grid - Show when loading (skeletons) or when we have capsules */}
        {!showEmptyState && (
          <AnimatePresence mode="wait">
            <motion.div
              key={showSkeletons ? 'skeletons' : `capsules-${capsules.length}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Show skeleton cards during initial load */}
              {showSkeletons
                ? Array.from({ length: 6 }).map((_, index) => (
                    <CapsuleCardSkeleton key={`skeleton-${index}`} />
                  ))
                : capsules.map(capsule => {
                    const address = capsule.publicKey.toBase58();
                    const timeRemaining =
                      realTimeRemaining[address] ?? capsule.timeRemaining;

                    return (
                      <CapsuleCard
                        key={address}
                        capsule={capsule}
                        timeRemaining={timeRemaining}
                      />
                    );
                  })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Show refetching indicator */}
        <RefetchingIndicator
          isRefetching={refetching && !showSkeletons && !showEmptyState}
        />
      </div>
    </div>
  );
}
