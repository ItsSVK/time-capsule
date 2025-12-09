'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Timer, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cardVariants } from '../constants';
import AnimatedHourglass from './AnimatedHourglass';

interface CountdownTimerCardProps {
  capsule: {
    account: {
      openTimestamp: { toNumber: () => number };
    };
  };
  realTimeRemaining: number;
}

export default function CountdownTimerCard({
  capsule,
  realTimeRemaining,
}: CountdownTimerCardProps) {
  const openTimestamp = capsule.account.openTimestamp.toNumber();

  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`border-2 shadow-xl backdrop-blur-xl bg-card/95 overflow-hidden ${
          realTimeRemaining === 0
            ? 'border-green-500/30'
            : 'border-amber-500/30'
        }`}
      >
        <div
          className={`absolute inset-0 bg-linear-to-br ${
            realTimeRemaining === 0
              ? 'from-green-500/10 via-emerald-500/5 to-teal-500/5'
              : 'from-amber-500/10 via-orange-500/5 to-purple-500/5'
          }`}
        />
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  realTimeRemaining === 0
                    ? 'bg-green-500/20'
                    : 'bg-amber-500/20'
                }`}
              >
                {realTimeRemaining === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Timer className="h-5 w-5 text-amber-500" />
                )}
              </div>
              {realTimeRemaining === 0
                ? 'Ready to Open!'
                : 'Time Until Unlock'}
            </CardTitle>
            {realTimeRemaining === 0 && (
              <motion.div
                className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-xs font-medium text-green-400">
                  ✨ UNLOCKED
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-4 pb-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Animated Hourglass */}
            <AnimatedHourglass
              targetTimestamp={openTimestamp}
              size="lg"
            />

            {/* Additional Info */}
            <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {realTimeRemaining === 0 ? 'Unlocked On' : 'Unlock Date'}
                </p>
                <p className="text-xl font-semibold">
                  {new Date(openTimestamp * 1000).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {realTimeRemaining === 0 ? 'At' : 'Unlock Time'}
                </p>
                <p className="text-xl font-semibold flex items-center gap-2">
                  <Clock
                    className={`h-5 w-5 ${
                      realTimeRemaining === 0
                        ? 'text-green-500'
                        : 'text-amber-500'
                    }`}
                  />
                  {new Date(openTimestamp * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {realTimeRemaining === 0 ? (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
                  >
                    <p className="text-sm font-medium text-green-500">
                      🎉 Ready for voting!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30"
                  >
                    <p className="text-sm font-medium text-amber-500">
                      ⏳ Capsule is locked
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

