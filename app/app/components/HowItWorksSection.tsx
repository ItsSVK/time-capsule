'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { steps } from './constants';

interface HowItWorksSectionProps {
  stepsInView: boolean;
}

const HowItWorksSection = forwardRef<HTMLElement, HowItWorksSectionProps>(
  ({ stepsInView }, ref) => {
    return (
      <motion.section
        ref={ref}
        className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-card/30"
      >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent, and secure. Get started in minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              animate={stepsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              <div className="relative z-10 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <step.icon className="h-10 w-10 text-white" />
                </motion.div>
                <div className="text-6xl font-bold text-primary/20 mb-2">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
    );
  }
);

HowItWorksSection.displayName = 'HowItWorksSection';

export default HowItWorksSection;

