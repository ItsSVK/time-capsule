'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  submitting,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between border-t border-border/50 pt-6 relative z-10 w-full">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="group border-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-11 px-6 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          Previous
        </Button>
      </motion.div>

      {currentStep < totalSteps ? (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={onNext}
            className="group shadow-lg bg-linear-to-r from-primary to-primary/90 hover:shadow-xl h-11 px-6 cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      ) : (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="shadow-xl bg-linear-to-r from-primary via-primary to-primary/90 hover:shadow-2xl h-11 px-8 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Processing...' : 'Create Capsule'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
