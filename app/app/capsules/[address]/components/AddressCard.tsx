'use client';

import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import type { ParsedCapsule } from '@/lib/solana/types';

interface AddressCardProps {
  capsule: ParsedCapsule;
  address: string;
}

export default function AddressCard({ capsule, address }: AddressCardProps) {
  return (
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
          <p className="text-xs text-muted-foreground mb-1">Capsule PDA</p>
          <p className="font-mono text-xs truncate">{address}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">NFT Mint</p>
          <p className="font-mono text-xs truncate">
            {capsule.account.nftMint.toBase58()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

