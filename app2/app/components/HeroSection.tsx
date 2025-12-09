'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Lock, Vote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  heroInView: boolean;
  heroY: any;
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  ({ heroInView, heroY }, ref) => {
    return (
      <motion.section
        ref={ref}
        style={{ y: heroY }}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32"
      >
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={heroInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Built on Solana Blockchain
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Time Capsules
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl">
              for the Future
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Lock your goals, predictions, and commitments in time. Let the
            community hold you accountable. Unlock your potential on-chain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/capsules">
              <Button
                size="lg"
                className="text-base px-6 py-2.5 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Capsules
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-2.5 border-2 hover:bg-primary/10"
              >
                Create Capsule
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 hidden lg:block"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
            <Lock className="h-10 w-10 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-40 right-10 hidden lg:block"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center">
            <Vote className="h-12 w-12 text-purple-400" />
          </div>
        </motion.div>
      </div>
    </motion.section>
    );
  }
);

HeroSection.displayName = 'HeroSection';

export default HeroSection;

