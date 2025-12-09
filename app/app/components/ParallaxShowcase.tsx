'use client';

import { useRef, useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import ParallaxSection from './ParallaxSection';
import { parallaxSections } from './constants';

export default function ParallaxShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: number;
      top: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }))
    );
  }, []);

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
