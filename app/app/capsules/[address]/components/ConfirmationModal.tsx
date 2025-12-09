'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type: 'cancel' | 'close';
  capsuleName?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  capsuleName,
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    cancel: {
      title: 'Cancel Capsule',
      description:
        'Are you sure you want to cancel this capsule? This action cannot be undone.',
      warning:
        'The capsule will be marked as cancelled. If there is any stake, it will be returned to you.',
      icon: XCircle,
      iconColor: 'text-amber-500',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'Cancel Capsule',
    },
    close: {
      title: 'Close Capsule',
      description:
        'Are you sure you want to close this capsule account? This will permanently delete the capsule data.',
      warning:
        'You will reclaim the rent SOL. Make sure all stakes have been claimed before closing.',
      icon: Trash2,
      iconColor: 'text-red-500',
      bgGradient: 'from-red-500/20 to-rose-500/10',
      borderColor: 'border-red-500/30',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      buttonText: 'Close Capsule',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`relative w-full max-w-md rounded-2xl border-2 ${currentConfig.borderColor} bg-card shadow-2xl backdrop-blur-xl overflow-hidden`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${currentConfig.bgGradient} opacity-50`}
              />

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div
                    className={`p-4 rounded-full bg-linear-to-br ${currentConfig.bgGradient} border ${currentConfig.borderColor}`}
                  >
                    <Icon className={`h-10 w-10 ${currentConfig.iconColor}`} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-center mb-2"
                >
                  {currentConfig.title}
                </motion.h2>

                {/* Capsule name */}
                {capsuleName && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-muted-foreground mb-4"
                  >
                    "{capsuleName}"
                  </motion.p>
                )}

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-center text-foreground/80 mb-4"
                >
                  {currentConfig.description}
                </motion.p>

                {/* Warning */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 mb-6"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {currentConfig.warning}
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex gap-3"
                >
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Go Back
                  </Button>
                  <Button
                    className={`flex-1 ${currentConfig.buttonColor} text-white`}
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Icon className="h-4 w-4 mr-2" />
                        {currentConfig.buttonText}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${
                    type === 'cancel' ? '#f59e0b' : '#ef4444'
                  } 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${
                    type === 'cancel' ? '#f59e0b' : '#ef4444'
                  } 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.2, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

