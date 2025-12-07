'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  Lock,
  Coins,
  CheckCircle,
  XCircle,
  User,
  Timer,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import BackgroundGradients from './create/components/BackgroundGradients';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCapsules } from '@/hooks/useCapsules';
import { CapsuleStatus, CapsuleResult } from '@/lib/solana/types';
import { Spinner } from '@/components/kibo-ui/spinner';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

// Helper functions
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ready';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const statusConfig = {
  [CapsuleStatus.Active]: {
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    icon: Lock,
    label: 'Locked',
  },
  [CapsuleStatus.OpenForVoting]: {
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    icon: Vote,
    label: 'Voting Open',
  },
  [CapsuleStatus.Resolved]: {
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    icon: CheckCircle,
    label: 'Resolved',
  },
  [CapsuleStatus.Cancelled]: {
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: XCircle,
    label: 'Cancelled',
  },
};

export default function Home() {
  const { publicKey } = useWallet();
  const { capsules, loading, error } = useCapsules();
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

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Spinner variant="throbber" className="size-10" />
          <p className="text-muted-foreground">Loading capsules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="relative z-10">
          <Card className="border-2 border-destructive/30 shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Error Loading Capsules
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (capsules.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative">
        <BackgroundGradients />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full">
              <CardContent className="pt-8 pb-8">
                <Sparkles className="w-20 h-20 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Capsules Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Be the first to create a time capsule!
                </p>
                <Link href="/create">
                  <Button size="lg" className="w-full">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Your First Capsule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative">
      <BackgroundGradients />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Time Capsules
              </h1>
              <p className="text-muted-foreground">
                Discover and explore time capsules from the community
              </p>
            </div>
            <Link href="/create">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Create Capsule
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Capsules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {capsules.map(capsule => {
            const address = capsule.publicKey.toBase58();
            const status = statusConfig[capsule.status];
            const StatusIcon = status.icon;
            const timeRemaining =
              realTimeRemaining[address] ?? capsule.timeRemaining;
            const hasStake = capsule.account.stakeAmount.toNumber() > 0;
            const stakeAmount =
              capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL;
            const isCreator =
              publicKey && capsule.account.creator.equals(publicKey);

            return (
              <motion.div key={address} variants={cardVariants}>
                <Link href={`/capsule/${address}`}>
                  <Card className="group border-2 border-border/50 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden h-full hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="relative">
                      {/* Status gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${status.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Image */}
                      {capsule.metadata?.image ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={capsule.metadata.image}
                            alt={capsule.metadata.name || 'Capsule'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-card/80 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="relative h-48 bg-linear-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Status Badge - Top Right */}
                      <div className="absolute top-4 right-4 z-10">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${status.bg} ${status.text} ${status.border}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                      </div>

                      {/* Creator Badge - Top Left */}
                      {isCreator && (
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm bg-primary/20 text-primary border border-primary/30">
                            <User className="h-3.5 w-3.5" />
                            Yours
                          </div>
                        </div>
                      )}

                      <CardContent className="relative z-10 p-6 space-y-4">
                        {/* Title */}
                        <div className="min-h-[80px]">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {capsule.metadata?.name || 'Untitled Capsule'}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {truncateText(
                              capsule.metadata?.description ||
                                'No description provided',
                              100
                            )}
                          </p>
                        </div>

                        {/* Time Info */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          {capsule.status === CapsuleStatus.Active && (
                            <div className="flex items-center gap-2 text-sm">
                              <Timer className="h-4 w-4 text-blue-500" />
                              <span className="text-muted-foreground">
                                Unlocks in:{' '}
                              </span>
                              <span className="font-semibold text-blue-500">
                                {formatTimeRemaining(timeRemaining)}
                              </span>
                            </div>
                          )}

                          {capsule.status === CapsuleStatus.OpenForVoting && (
                            <div className="flex items-center gap-2 text-sm">
                              <Vote className="h-4 w-4 text-purple-500" />
                              <span className="text-muted-foreground">
                                Voting ends in:{' '}
                              </span>
                              <span className="font-semibold text-purple-500">
                                {formatTimeRemaining(timeRemaining)}
                              </span>
                            </div>
                          )}

                          {capsule.status === CapsuleStatus.Resolved && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="font-semibold text-green-500">
                                {capsule.result === CapsuleResult.Success
                                  ? 'Goal Achieved! ✨'
                                  : 'Voting Completed'}
                              </span>
                            </div>
                          )}

                          {/* Unlock Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(
                              capsule.account.openTimestamp.toNumber() * 1000
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 min-h-[100px]">
                          {/* Votes */}
                          {
                            <div className="flex items-center gap-2">
                              <Vote className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Votes
                                </p>
                                <p className="text-sm font-semibold">
                                  {capsule.status ===
                                    CapsuleStatus.OpenForVoting ||
                                  capsule.status === CapsuleStatus.Resolved
                                    ? capsule.totalVotes
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          }

                          {/* Stake */}
                          {hasStake && (
                            <div className="flex items-center gap-2">
                              <Coins className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Stake
                                </p>
                                <p className="text-sm font-semibold text-amber-500">
                                  {stakeAmount.toFixed(2)} SOL
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Creator */}
                          <div className="flex items-center gap-2 col-span-2">
                            <User className="h-4 w-4 text-cyan-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Creator
                              </p>
                              <p className="text-sm font-mono truncate">
                                {truncateAddress(
                                  capsule.account.creator.toBase58()
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* View Button */}
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
