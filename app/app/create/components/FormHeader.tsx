'use client';

import { motion } from 'framer-motion';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Step } from '../types';
import { itemVariants } from '../constants';

interface FormHeaderProps {
  currentStep: number;
  steps: Step[];
}

export default function FormHeader({ currentStep, steps }: FormHeaderProps) {
  return (
    <CardHeader className="relative z-10 border-b border-border/50 pb-8 space-y-3">
      <motion.div variants={itemVariants}>
        <CardTitle className="text-4xl font-bold bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Create Time Capsule
        </CardTitle>
      </motion.div>
      <motion.div variants={itemVariants}>
        <CardDescription className="text-base text-muted-foreground">
          {steps[currentStep - 1].description}
        </CardDescription>
      </motion.div>
    </CardHeader>
  );
}

