'use client';

import { Coins, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import { formatStakeDestination } from '../utils';
import {
  CapsuleResult,
  CapsuleStatus,
  ParsedCapsule,
} from '@/lib/solana/types';

interface StakeCardProps {
  capsule: ParsedCapsule;
  stakeAmount: number;
  canClaimStake: boolean;
}

export default function StakeCard({
  capsule,
  stakeAmount,
  canClaimStake,
}: StakeCardProps) {
  const isResolved = capsule.status === CapsuleStatus.Resolved;
  const isSuccess = capsule.result === CapsuleResult.Success;

  return (
    <Card
      className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
        isResolved
          ? isSuccess
            ? 'border-green-500/30'
            : 'border-amber-500/30'
          : 'border-amber-500/30'
      }`}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${
          isResolved && isSuccess
            ? 'from-green-500/10 to-emerald-500/5'
            : 'from-amber-500/10 to-orange-500/5'
        }`}
      />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-base">
          <div
            className={`p-2 rounded-xl ${
              isResolved && isSuccess ? 'bg-green-500/20' : 'bg-amber-500/20'
            }`}
          >
            <Coins
              className={`h-4 w-4 ${
                isResolved && isSuccess ? 'text-green-500' : 'text-amber-500'
              }`}
            />
          </div>
          Stake Details
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Amount Staked</p>
          <p
            className={`text-2xl font-bold ${
              isResolved && isSuccess ? 'text-green-500' : 'text-amber-500'
            }`}
          >
            {stakeAmount.toFixed(4)} SOL
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {isResolved ? 'Stake Goes To' : 'If Failed, Goes To'}
          </p>
          <p className="font-semibold flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {isResolved && isSuccess
              ? 'Creator (Goal Achieved!)'
              : formatStakeDestination(capsule.stakeDestination)}
          </p>
        </div>

        {/* Status Badge */}
        {isResolved && (
          <div
            className={`p-3 rounded-lg text-center ${
              isSuccess
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-amber-500/10 border border-amber-500/20'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                isSuccess ? 'text-green-500' : 'text-amber-500'
              }`}
            >
              {isSuccess
                ? '✅ Goal Achieved - Stake Returnable'
                : `⚡ Stake claimable by ${formatStakeDestination(
                    capsule.stakeDestination
                  )}`}
            </p>
          </div>
        )}

        {/* Who can claim info for non-creators */}
        {isResolved && !canClaimStake && stakeAmount > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            You are not eligible to claim this stake
          </p>
        )}
      </CardContent>
    </Card>
  );
}
