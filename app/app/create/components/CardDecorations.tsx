'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function CardDecorations() {
  return (
    <>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />

      {/* Animated sparkle effect */}
      <motion.div
        className="absolute top-0 right-0 text-primary/20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Sparkles className="w-32 h-32 -mr-16 -mt-16" />
      </motion.div>
    </>
  );
}

