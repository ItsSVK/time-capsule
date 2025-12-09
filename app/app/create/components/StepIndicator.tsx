'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Step } from '../types';
import { itemVariants } from '../constants';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <motion.div className="mb-10 w-full" variants={itemVariants}>
      {/* Container with relative positioning for connector lines */}
      <div className="relative">
        {/* Connector lines layer - positioned behind circles with z-0 */}
        <div className="absolute top-7 left-0 right-0 flex items-center px-7 z-0">
          {steps.slice(0, -1).map((step, index) => (
            <div key={`connector-${index}`} className="flex-1 h-1 mx-2">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-border/30 rounded-full" />
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-primary to-primary/80 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: currentStep > step.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Step circles layer - z-10 to appear above connectors */}
        <div className="relative flex justify-between z-10">
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                className="relative"
                initial={false}
                animate={{
                  scale: currentStep === step.id ? 1 : 0.9,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Glow effect for active/completed steps */}
                {currentStep >= step.id && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                    animate={{
                      scale: currentStep === step.id ? [1, 1.3, 1] : 1,
                      opacity: currentStep === step.id ? [0.5, 0.8, 0.5] : 0.3,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 relative ${
                    currentStep > step.id
                      ? 'bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-lg shadow-primary/30'
                      : currentStep === step.id
                      ? 'border-primary bg-card text-primary ring-4 ring-primary/20 shadow-lg'
                      : 'border-border/60 bg-card text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {currentStep > step.id ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Check className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-sm font-bold"
                      >
                        {step.id}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              <motion.p
                className={`mt-3 text-xs font-semibold transition-colors duration-300 whitespace-nowrap ${
                  currentStep >= step.id
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
                animate={{
                  scale: currentStep === step.id ? 1.05 : 1,
                }}
              >
                {step.title}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
