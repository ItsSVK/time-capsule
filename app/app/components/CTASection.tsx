'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
        </motion.div>

        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Ready to Create Your First Capsule?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of users who are using time capsules to achieve their
          goals and make their predictions come true.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg" className="text-base px-6 py-2.5 group">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/capsules">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-6 py-2.5 border-2"
            >
              Browse Capsules
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

