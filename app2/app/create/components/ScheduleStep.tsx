'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FormData } from '../types';
import { slideVariants } from '../constants';
import { VOTING_DURATION_OPTIONS } from '@/lib/solana/constants';
import { StakeDestination } from '@/lib/solana/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScheduleStepProps {
  direction: number;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export default function ScheduleStep({
  direction,
  register,
  errors,
}: ScheduleStepProps) {
  const [isStakeExpanded, setIsStakeExpanded] = useState(false);
  return (
    <motion.div
      key="step-2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6 relative w-full"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unlockDate" className="text-sm font-semibold">
            Unlock Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unlockDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('unlockDate', {
              required: 'Unlock date is required',
              validate: value => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return (
                  selectedDate > today || 'Unlock date must be in the future'
                );
              },
            })}
            className={`h-12 border-2 transition-all duration-200 ${
              errors.unlockDate
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
            }`}
          />
          <AnimatePresence>
            {errors.unlockDate && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive"
              >
                {errors.unlockDate.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unlockTime" className="text-sm font-semibold">
            Unlock Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unlockTime"
            type="time"
            {...register('unlockTime', {
              required: 'Unlock time is required',
            })}
            className={`h-12 border-2 transition-all duration-200 ${
              errors.unlockTime
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
            }`}
          />
          <AnimatePresence>
            {errors.unlockTime && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive"
              >
                {errors.unlockTime.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="votingDuration" className="text-sm font-semibold">
            Voting Duration <span className="text-destructive">*</span>
          </Label>
          <Select
            id="votingDuration"
            {...register('votingDuration', {
              required: 'Voting duration is required',
              valueAsNumber: true,
            })}
            className={`h-12 border-2 transition-all duration-200 ${
              errors.votingDuration
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
            }`}
          >
            <option value="">Select duration</option>
            {VOTING_DURATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <AnimatePresence>
            {errors.votingDuration && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive"
              >
                {errors.votingDuration.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quorum" className="text-sm font-semibold">
            Quorum (Minimum Votes) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quorum"
            type="number"
            min="1"
            placeholder="e.g., 5"
            {...register('quorum', {
              required: 'Quorum is required',
              min: {
                value: 1,
                message: 'Quorum must be at least 1',
              },
              valueAsNumber: true,
            })}
            className={`h-12 border-2 transition-all duration-200 ${
              errors.quorum
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
            }`}
          />
          <AnimatePresence>
            {errors.quorum && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive"
              >
                {errors.quorum.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapsible Stake Section */}
      <div className="border-2 border-border/40 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsStakeExpanded(!isStakeExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors duration-200"
        >
          <Label className="text-sm font-semibold cursor-pointer">
            Stake Settings (Optional)
          </Label>
          <motion.div
            animate={{ rotate: isStakeExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isStakeExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="stakeAmount"
                    className="text-sm font-semibold"
                  >
                    Stake Amount (SOL)
                  </Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1.5"
                    {...register('stakeAmount', {
                      min: {
                        value: 0,
                        message:
                          'Stake amount must be greater than or equal to 0',
                      },
                      valueAsNumber: true,
                    })}
                    className={`h-12 border-2 transition-all duration-200 ${
                      errors.stakeAmount
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
                    }`}
                  />
                  <AnimatePresence>
                    {errors.stakeAmount && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.stakeAmount.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="stakeDestination"
                    className="text-sm font-semibold"
                  >
                    If You Fail, Stake Goes To
                  </Label>
                  <Select
                    id="stakeDestination"
                    {...register('stakeDestination')}
                    className={`h-12 border-2 transition-all duration-200 ${
                      errors.stakeDestination
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
                    }`}
                  >
                    <option value={StakeDestination.ReturnToCreator}>
                      Return to Me (No Risk)
                    </option>
                    <option value={StakeDestination.CommunityPool}>
                      Community Pool
                    </option>
                    <option value={StakeDestination.Charity}>Charity</option>
                    <option value={StakeDestination.TopVoters}>
                      Top Voters
                    </option>
                  </Select>
                  <AnimatePresence>
                    {errors.stakeDestination && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.stakeDestination.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
