'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  Vote,
  Coins,
  Clock,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Calendar,
  CheckCircle,
  TrendingUp,
  Globe,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundGradients from './create/components/BackgroundGradients';

const features = [
  {
    icon: Lock,
    title: 'Time-Locked Capsules',
    description:
      'Create capsules that unlock at a future date. Set your goals, predictions, or commitments and let time reveal the outcome.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Vote,
    title: 'Community Voting',
    description:
      'When your capsule opens, the community votes to determine success. Transparent, democratic, and fair resolution.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Coins,
    title: 'Accountability Stakes',
    description:
      'Optional stakes add weight to your commitments. Choose where stakes go on success or failure.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'On-Chain Security',
    description:
      'Built on Solana blockchain. Your capsules are immutable, transparent, and secured by decentralized technology.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      "Solana's high-speed transactions mean instant capsule creation and voting. No waiting, no delays.",
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Social Accountability',
    description:
      'Share your goals publicly. Let the community hold you accountable and celebrate your achievements together.',
    color: 'from-rose-500 to-pink-500',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Your Capsule',
    description:
      'Set your goal, prediction, or commitment. Add an optional stake and choose when it unlocks.',
    icon: Calendar,
  },
  {
    number: '02',
    title: 'Wait for Unlock',
    description:
      'Your capsule remains locked until the chosen date. Share it with friends and build anticipation.',
    icon: Clock,
  },
  {
    number: '03',
    title: 'Community Votes',
    description:
      'Once unlocked, the community votes on whether your goal was achieved or prediction came true.',
    icon: Vote,
  },
  {
    number: '04',
    title: 'Resolution',
    description:
      'Stakes are resolved based on the vote. Success means you keep your stake, failure distributes it.',
    icon: CheckCircle,
  },
];

// Parallax Showcase Component - Individual Section
function ParallaxSection({
  section,
  index,
  totalSections,
  scrollYProgress,
  particles,
}: {
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
}) {
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

  const opacity = useTransform(sectionProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

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

// Parallax Showcase Component
function ParallaxShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const parallaxSections = [
    {
      title: 'Lock Your Future',
      subtitle: 'Time-locked commitments',
      gradient: 'from-blue-600/80 via-purple-600/80 to-pink-600/80',
      icon: Lock,
      content:
        'Create capsules that unlock at your chosen moment. Set goals, make predictions, commit to change.',
    },
    {
      title: 'Community Decides',
      subtitle: 'Democratic resolution',
      gradient: 'from-purple-600/80 via-pink-600/80 to-rose-600/80',
      icon: Vote,
      content:
        'When your capsule opens, the community votes. Transparent, fair, and decentralized.',
    },
    {
      title: 'Stake Your Claim',
      subtitle: 'Accountability matters',
      gradient: 'from-amber-600/80 via-orange-600/80 to-red-600/80',
      icon: Coins,
      content:
        'Add stakes to show commitment. Choose where they go on success or failure.',
    },
  ];

  // Generate particle positions once
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      })),
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative -mt-32"
      style={{ height: `${(parallaxSections.length + 1) * 100}vh` }}
    >
      {parallaxSections.map((section, index) => (
        <ParallaxSection
          key={index}
          section={section}
          index={index}
          totalSections={parallaxSections.length}
          scrollYProgress={scrollYProgress}
          particles={particles}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const featuresY = useTransform(scrollYProgress, [0.2, 0.8], [0, -50]);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.2 });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundGradients />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
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

      {/* Parallax Showcase Section */}
      <ParallaxShowcase />

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        style={{ y: featuresY }}
        className="relative py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and resolve your time
              capsules
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        ref={stepsRef}
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Built on Solana
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Crafted with care by</span>
              <span className="font-semibold text-primary">SVK</span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/capsules"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Capsules
              </Link>
              <Link
                href="/create"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Create
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
