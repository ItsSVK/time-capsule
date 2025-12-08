'use client';

import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Tag,
  Trophy,
  Sparkles,
  Copy,
  ExternalLink,
  Ban,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CapsuleStatus, CapsuleResult, ParsedCapsule } from '@/lib/solana/types';

interface HeroSectionProps {
  capsule: ParsedCapsule;
  isCreator: boolean;
  canCancel: boolean;
  canClose: boolean;
  onCancelClick: () => void;
  onCloseClick: () => void;
  onCopyAddress: (address: string) => void;
}

const statusConfig = {
  [CapsuleStatus.Active]: {
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    icon: 'Lock',
    label: 'Locked',
  },
  [CapsuleStatus.OpenForVoting]: {
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    icon: 'Vote',
    label: 'Voting Open',
  },
  [CapsuleStatus.Resolved]: {
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
    icon: 'CheckCircle',
    label: 'Resolved',
  },
  [CapsuleStatus.Cancelled]: {
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    icon: 'XCircle',
    label: 'Cancelled',
  },
};

export default function HeroSection({
  capsule,
  isCreator,
  canCancel,
  canClose,
  onCancelClick,
  onCloseClick,
  onCopyAddress,
}: HeroSectionProps) {
  const metadata = capsule.metadata;
  const status = statusConfig[capsule.status];
  const address = capsule.publicKey.toBase58();

  return (
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
                  onClick={onCancelClick}
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
                  onClick={onCloseClick}
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
                  onClick={() => onCopyAddress(address)}
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
  );
}

