'use client';

import { User, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cardVariants } from '../constants';
import { truncateAddress } from '../utils';
import type { ParsedCapsule } from '@/lib/solana/types';

interface CreatorCardProps {
  capsule: ParsedCapsule;
  isCreator: boolean;
  onCopyAddress: (address: string) => void;
}

export default function CreatorCard({
  capsule,
  isCreator,
  onCopyAddress,
}: CreatorCardProps) {
  return (
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
          onClick={() => onCopyAddress(capsule.account.creator.toBase58())}
        >
          <Copy className="h-3 w-3" />
          Copy Creator Address
        </Button>
      </CardContent>
    </Card>
  );
}

