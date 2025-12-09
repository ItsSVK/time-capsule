'use client';

import { useRef } from 'react';
import { useScroll, useTransform, useInView } from 'framer-motion';
import BackgroundGradients from './create/components/BackgroundGradients';
import HeroSection from './components/HeroSection';
import ParallaxShowcase from './components/ParallaxShowcase';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

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

      <HeroSection heroInView={heroInView} heroY={heroY} ref={heroRef} />
      <ParallaxShowcase />
      <FeaturesSection
        featuresInView={featuresInView}
        featuresY={featuresY}
        ref={featuresRef}
      />
      <HowItWorksSection stepsInView={stepsInView} ref={stepsRef} />
      <CTASection />
      <Footer />
    </div>
  );
}
