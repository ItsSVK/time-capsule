'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData } from '../types';
import { slideVariants } from '../constants';
import { VOTING_DURATION_OPTIONS } from '@/lib/solana/constants';
import { StakeDestination } from '@/lib/solana/types';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  Image as ImageIcon,
  Tag,
  Lock,
  Globe,
  Coins,
  ArrowRight,
  X,
} from 'lucide-react';

interface ReviewStepProps {
  direction: number;
  formData: FormData;
}

// Helper function to format voting duration
function formatVotingDuration(seconds: number): string {
  const option = VOTING_DURATION_OPTIONS.find(opt => opt.value === seconds);
  return option ? option.label : `${seconds} seconds`;
}

// Helper function to format stake destination
function formatStakeDestination(destination: StakeDestination): string {
  const labels: Record<StakeDestination, string> = {
    [StakeDestination.CommunityPool]: 'Community Pool',
    [StakeDestination.Charity]: 'Charity',
    [StakeDestination.ReturnToCreator]: 'Return to Creator',
  };
  return labels[destination] || destination;
}

export default function ReviewStep({ direction, formData }: ReviewStepProps) {
  const {
    title,
    description,
    category,
    file,
    unlockDate,
    unlockTime,
    votingDuration,
    quorum,
    stakeAmount,
    stakeDestination,
    stakeDestinationAddress,
  } = formData;

  const hasFile = file && file.length > 0;
  const hasStake =
    stakeAmount !== null && stakeAmount !== undefined && stakeAmount > 0;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasFile && file[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file[0]);
    } else {
      setImagePreview(null);
    }
  }, [file, hasFile]);

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverlayOpen) {
        setIsOverlayOpen(false);
      }
    };

    if (isOverlayOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOverlayOpen]);

  return (
    <motion.div
      key="step-3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-col w-full"
    >
      <div className="flex flex-col gap-4 w-full pb-4">
        {/* Header Section */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground leading-tight">
                {title || 'Untitled Capsule'}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Tag className="h-3 w-3" />
                  {category || 'Uncategorized'}
                </span>
              </div>
            </div>
            {hasFile && imagePreview && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border/40 bg-muted shadow-lg shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          className="rounded-xl bg-muted/30 p-4 border border-border/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {description || 'No description provided'}
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div
          className={`grid grid-cols-${
            hasFile && imagePreview ? '2' : '1'
          } gap-4`}
        >
          {/* Left Column */}
          <div
            className={`flex flex-${
              hasFile && imagePreview ? 'col' : 'row'
            } gap-4 w-full`}
          >
            {/* Schedule Section */}
            <motion.div
              className={`rounded-xl bg-linear-to-br from-blue-500/10 to-blue-600/5 p-4 border border-blue-500/20 ${
                hasFile && imagePreview ? 'w-full' : 'w-1/2'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Schedule
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Unlock Date
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {unlockDate
                      ? new Date(unlockDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Unlock Time
                  </p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {unlockTime || 'Not set'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Voting Section */}
            <motion.div
              className={`rounded-xl bg-linear-to-br from-purple-500/10 to-purple-600/5 p-4 border border-purple-500/20 ${
                hasFile && imagePreview ? 'w-full' : 'w-1/2'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Vote className="h-4 w-4 text-purple-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Voting
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="text-sm font-semibold text-foreground">
                    {votingDuration
                      ? formatVotingDuration(votingDuration)
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Quorum</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    {quorum || 'Not set'} votes required
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}

          {/* Image Section */}
          {hasFile && imagePreview && (
            <div className="flex flex-col gap-4">
              <motion.div
                className="rounded-xl bg-linear-to-br from-green-500/10 to-green-600/5 p-4 border border-green-500/20 h-[325px]"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <ImageIcon className="h-4 w-4 text-green-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Attached Image
                  </h4>
                </div>
                <div className="space-y-2">
                  <div
                    className="relative w-full aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted h-[233px] cursor-pointer group"
                    onClick={() => setIsOverlayOpen(true)}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <ImageIcon className="h-8 w-8 text-white drop-shadow-lg" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{file[0].name}</span>
                    <span className="shrink-0">
                      ({(file[0].size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Stake Section - Full Width */}
        {hasStake && (
          <motion.div
            className="rounded-xl bg-linear-to-br from-amber-500/10 to-amber-600/5 p-4 border border-amber-500/20 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stake Settings
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-sm font-semibold text-foreground">
                  {stakeAmount} SOL
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  If Failed, Goes To
                </p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5" />
                  {stakeDestination
                    ? formatStakeDestination(stakeDestination)
                    : 'Not set'}
                </p>
              </div>
              {stakeDestinationAddress &&
                stakeDestination !== StakeDestination.ReturnToCreator && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Destination Address
                    </p>
                    <p className="text-sm font-mono text-foreground break-all">
                      {stakeDestinationAddress}
                    </p>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Overlay - Rendered via Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOverlayOpen && imagePreview && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                  onClick={() => setIsOverlayOpen(false)}
                />

                {/* Overlay Content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  onClick={() => setIsOverlayOpen(false)}
                >
                  <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                    {/* Close Button */}
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.2 }}
                      onClick={e => {
                        e.stopPropagation();
                        setIsOverlayOpen(false);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors duration-200 shadow-lg"
                      aria-label="Close preview"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>

                    {/* Image Container */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="relative max-w-full max-h-full w-auto h-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={imagePreview}
                        alt="Full size preview"
                        className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                      />
                    </motion.div>

                    {/* Image Info */}
                    {hasFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span className="truncate max-w-md">
                            {file[0].name}
                          </span>
                          <span className="text-xs text-white/70">
                            ({(file[0].size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
}
