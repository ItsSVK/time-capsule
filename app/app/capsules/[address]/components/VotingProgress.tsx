'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface VotingProgressProps {
  yesVotes: number;
  noVotes: number;
  quorum: number;
}

export default function VotingProgress({
  yesVotes,
  noVotes,
  quorum,
}: VotingProgressProps) {
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

