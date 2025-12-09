'use client';

import { motion, useTransform } from 'framer-motion';
import { Lock, Vote, Coins } from 'lucide-react';

interface ParallaxSectionProps {
  section: {
    title: string;
    subtitle: string;
    gradient: string;
    icon: React.ComponentType<{ className?: string }>;
    content: string;
  };
  index: number;
  totalSections: number;
  scrollYProgress: any;
  particles: Array<{
    id: number;
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>;
}

export default function ParallaxSection({
  section,
  index,
  totalSections,
  scrollYProgress,
  particles,
}: ParallaxSectionProps) {
  const sectionStart = index / totalSections;
  const sectionEnd = (index + 1) / totalSections;

  // Create a localized scroll progress for this section
  const sectionProgress = useTransform(
    scrollYProgress,
    [sectionStart, sectionEnd],
    [0, 1]
  );

  // Animation phases: Enter -> Hold -> Exit
  // Enter: 0.0 - 0.2 (Card grows and fades in)
  // Hold: 0.2 - 0.9 (Card stays full screen)
  // Exit: 0.9 - 1.0 (Card fades out slightly/scales down as next one arrives)

  const opacity = useTransform(
    sectionProgress,
    [0, 0.2, 0.9, 1],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    sectionProgress,
    [0, 0.2, 0.9, 1],
    [0.5, 1, 1, 0.95] // Start much smaller (0.5), expand to full (1), stay, then slight shrink
  );

  const y = useTransform(
    sectionProgress,
    [0, 0.2, 0.9, 1],
    ['50vh', '30vh', '30vh', '50vh'] // Center is technically 0, but we need to push it down (positive y) to avoid top cut-off
  );

  const rotateX = useTransform(
    sectionProgress,
    [0, 0.2, 0.9, 1],
    [20, 0, 0, -5]
  );

  return (
    <motion.section
      style={{
        opacity,
        scale,
        y,
        rotateX,
      }}
      className="sticky top-0 h-screen flex items-center justify-center overflow-hidden w-full"
    >
      {/* Background with gradient - Full Screen Card */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${section.gradient} backdrop-blur-3xl shadow-2xl rounded-none sm:rounded-3xl mx-0 sm:mx-4 my-0 sm:my-4`}
      />

      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-block mb-8"
          >
            <div
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20`}
            >
              <section.icon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg font-bold text-white/80 uppercase tracking-widest mb-4"
          >
            {section.subtitle}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight"
          >
            {section.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="text-xl sm:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {section.content}
          </motion.p>
        </motion.div>
      </div>

      {/* Floating particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-white/40"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.section>
  );
}

