import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Calendar,
  Clock,
  Vote,
  Coins,
  CheckCircle,
  User,
  Timer,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParsedCapsule, CapsuleStatus, CapsuleResult } from '@/lib/solana/types';
import { statusConfig, cardVariants } from './constants';
import { formatTimeRemaining, truncateText, truncateAddress } from './utils';

interface CapsuleCardProps {
  capsule: ParsedCapsule;
  timeRemaining: number;
}

export default function CapsuleCard({
  capsule,
  timeRemaining,
}: CapsuleCardProps) {
  const { publicKey } = useWallet();
  const address = capsule.publicKey.toBase58();
  const status = statusConfig[capsule.status];
  const StatusIcon = status.icon;
  const hasStake = capsule.account.stakeAmount.toNumber() > 0;
  const stakeAmount =
    capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL;
  const isCreator = publicKey && capsule.account.creator.equals(publicKey);

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/capsules/${address}`}>
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
                    capsule.metadata?.description || 'No description provided',
                    100
                  )}
                </p>
              </div>

              {/* Time Info */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                {capsule.status === CapsuleStatus.Active && (
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Unlocks in: </span>
                    <span className="font-semibold text-blue-500">
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                )}

                {capsule.status === CapsuleStatus.OpenForVoting && (
                  <div className="flex items-center gap-2 text-sm">
                    <Vote className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">Voting ends in: </span>
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
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Votes</p>
                    <p className="text-sm font-semibold">
                      {capsule.status === CapsuleStatus.OpenForVoting ||
                      capsule.status === CapsuleStatus.Resolved
                        ? capsule.totalVotes
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Stake */}
                {hasStake && (
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Stake</p>
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
                    <p className="text-xs text-muted-foreground">Creator</p>
                    <p className="text-sm font-mono truncate">
                      {truncateAddress(capsule.account.creator.toBase58())}
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
}

