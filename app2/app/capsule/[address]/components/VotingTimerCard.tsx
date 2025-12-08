'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Vote, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import AnimatedHourglass from './AnimatedHourglass';

interface VotingTimerCardProps {
  capsule: {
    account: {
      openTimestamp: { toNumber: () => number };
      votingEndTimestamp: { toNumber: () => number };
    };
    totalVotes: number;
  };
  realVotingTimeRemaining: number;
}

export default function VotingTimerCard({
  capsule,
  realVotingTimeRemaining,
}: VotingTimerCardProps) {
  const openTimestamp = capsule.account.openTimestamp.toNumber();
  const votingEndTimestamp = capsule.account.votingEndTimestamp.toNumber();

  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
          realVotingTimeRemaining === 0
            ? 'border-violet-500/30'
            : 'border-purple-500/30'
        }`}
      >
        <div
          className={`absolute inset-0 bg-linear-to-br ${
            realVotingTimeRemaining === 0
              ? 'from-violet-500/10 via-purple-500/5 to-indigo-500/5'
              : 'from-purple-500/10 via-pink-500/5 to-violet-500/5'
          }`}
        />
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  realVotingTimeRemaining === 0
                    ? 'bg-violet-500/20'
                    : 'bg-purple-500/20'
                }`}
              >
                {realVotingTimeRemaining === 0 ? (
                  <Hourglass className="h-5 w-5 text-violet-500" />
                ) : (
                  <Vote className="h-5 w-5 text-purple-500" />
                )}
              </div>
              {realVotingTimeRemaining === 0
                ? 'Voting Ended'
                : 'Voting Period'}
            </CardTitle>
            {realVotingTimeRemaining > 0 && (
              <motion.div
                className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs font-medium text-purple-400">
                  🔴 LIVE
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-4 pb-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Animated Hourglass for voting */}
            <AnimatedHourglass
              targetTimestamp={votingEndTimestamp}
              createdTimestamp={openTimestamp}
              size="md"
            />

            {/* Voting Info */}
            <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {realVotingTimeRemaining === 0
                    ? 'Voting Ended'
                    : 'Voting Ends'}
                </p>
                <p className="text-lg font-semibold">
                  {new Date(votingEndTimestamp * 1000).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold text-purple-500">
                  {capsule.totalVotes}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {realVotingTimeRemaining === 0 ? (
                  <motion.div
                    key="ended"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30"
                  >
                    <p className="text-sm font-medium text-violet-500">
                      ⏰ Ready to resolve
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30"
                  >
                    <p className="text-sm font-medium text-purple-500">
                      🗳️ Voting is open!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

