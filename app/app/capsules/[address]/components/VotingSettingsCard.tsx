'use client';

import { Vote, Timer, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import { formatVotingDuration } from '../utils';
import type { ParsedCapsule } from '@/lib/solana/types';

interface VotingSettingsCardProps {
  capsule: ParsedCapsule;
}

export default function VotingSettingsCard({
  capsule,
}: VotingSettingsCardProps) {
  return (
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
          <p className="text-xs text-muted-foreground mb-1">Required Quorum</p>
          <p className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {capsule.account.quorum.toNumber()} votes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

