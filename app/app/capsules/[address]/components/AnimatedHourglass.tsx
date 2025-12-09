'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedHourglassProps {
  targetTimestamp: number;
  createdTimestamp?: number;
  size?: 'sm' | 'md' | 'lg';
}

interface SandParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
}

export default function AnimatedHourglass({
  targetTimestamp,
  createdTimestamp,
  size = 'lg',
}: AnimatedHourglassProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [particles, setParticles] = useState<SandParticle[]>([]);

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 180, sandWidth: 40 },
    md: { width: 180, height: 270, sandWidth: 60 },
    lg: { width: 240, height: 360, sandWidth: 80 },
  };

  const config = sizeConfig[size];

  // Calculate total duration for percentage
  const totalDuration = useMemo(() => {
    if (createdTimestamp) {
      return targetTimestamp - createdTimestamp;
    }
    // Default to showing based on remaining time if no created timestamp
    return Math.max(timeLeft.total, 1);
  }, [targetTimestamp, createdTimestamp, timeLeft.total]);

  // Calculate percentage remaining
  const percentageRemaining = useMemo(() => {
    if (isExpired) return 0;
    if (!createdTimestamp) {
      // If no created timestamp, estimate based on a reasonable duration
      return Math.min(100, Math.max(0, (timeLeft.total / (24 * 60 * 60)) * 100));
    }
    return Math.min(100, Math.max(0, (timeLeft.total / totalDuration) * 100));
  }, [timeLeft.total, totalDuration, isExpired, createdTimestamp]);

  // Generate sand particles
  useEffect(() => {
    if (isExpired) {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      const newParticles: SandParticle[] = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * 20 - 10,
          delay: Math.random() * 0.5,
          duration: 0.8 + Math.random() * 0.4,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 1000);
    return () => clearInterval(interval);
  }, [isExpired]);

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
        total: diff,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const topSandHeight = (percentageRemaining / 100) * 40;
  const bottomSandHeight = ((100 - percentageRemaining) / 100) * 40;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hourglass Container */}
      <div
        className="relative"
        style={{ width: config.width, height: config.height }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500 via-orange-400 to-amber-600 rounded-full" />
        </div>

        {/* SVG Hourglass */}
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full relative z-10"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(245, 158, 11, 0.3))' }}
        >
          <defs>
            {/* Gradient for glass */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>

            {/* Gradient for sand */}
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Gradient for frame */}
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Clip path for top bulb */}
            <clipPath id="topBulb">
              <path d="M20,10 Q20,45 50,55 Q80,45 80,10 L80,5 L20,5 Z" />
            </clipPath>

            {/* Clip path for bottom bulb */}
            <clipPath id="bottomBulb">
              <path d="M20,140 Q20,105 50,95 Q80,105 80,140 L80,145 L20,145 Z" />
            </clipPath>
          </defs>

          {/* Frame - Top */}
          <rect
            x="15"
            y="2"
            width="70"
            height="8"
            rx="3"
            fill="url(#frameGradient)"
            className="drop-shadow-lg"
          />

          {/* Frame - Bottom */}
          <rect
            x="15"
            y="140"
            width="70"
            height="8"
            rx="3"
            fill="url(#frameGradient)"
            className="drop-shadow-lg"
          />

          {/* Glass outline */}
          <path
            d="M20,10 Q20,50 50,75 Q80,50 80,10 M20,140 Q20,100 50,75 Q80,100 80,140"
            fill="none"
            stroke="url(#glassGradient)"
            strokeWidth="3"
            className="drop-shadow-md"
          />

          {/* Glass fill - subtle */}
          <path
            d="M20,10 Q20,50 50,75 Q80,50 80,10 L80,10 Q80,50 50,75 Q20,50 20,10 Z"
            fill="rgba(255,255,255,0.05)"
          />
          <path
            d="M20,140 Q20,100 50,75 Q80,100 80,140 L80,140 Q80,100 50,75 Q20,100 20,140 Z"
            fill="rgba(255,255,255,0.05)"
          />

          {/* Top sand */}
          <g clipPath="url(#topBulb)">
            <motion.rect
              x="20"
              width="60"
              fill="url(#sandGradient)"
              initial={{ y: 10, height: 45 }}
              animate={{
                y: 10 + (45 - topSandHeight),
                height: topSandHeight,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </g>

          {/* Bottom sand */}
          <g clipPath="url(#bottomBulb)">
            <motion.rect
              x="20"
              width="60"
              fill="url(#sandGradient)"
              initial={{ y: 145 - bottomSandHeight, height: bottomSandHeight }}
              animate={{
                y: 145 - bottomSandHeight,
                height: bottomSandHeight,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </g>

          {/* Falling sand stream */}
          {!isExpired && percentageRemaining > 0 && (
            <g>
              {/* Main stream */}
              <motion.line
                x1="50"
                y1="55"
                x2="50"
                y2="95"
                stroke="url(#sandGradient)"
                strokeWidth="2"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />

              {/* Particles */}
              <AnimatePresence>
                {particles.map(particle => (
                  <motion.circle
                    key={particle.id}
                    cx={50 + particle.x}
                    r="1.5"
                    fill="#f59e0b"
                    initial={{ cy: 55, opacity: 1 }}
                    animate={{ cy: 95, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: 'easeIn',
                    }}
                  />
                ))}
              </AnimatePresence>
            </g>
          )}

          {/* Shine effect on glass */}
          <ellipse
            cx="35"
            cy="30"
            rx="8"
            ry="15"
            fill="rgba(255,255,255,0.15)"
            transform="rotate(-20 35 30)"
          />
          <ellipse
            cx="35"
            cy="120"
            rx="8"
            ry="15"
            fill="rgba(255,255,255,0.1)"
            transform="rotate(-20 35 120)"
          />

          {/* Decorative elements on frame */}
          <circle cx="25" cy="6" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="50" cy="6" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="75" cy="6" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="25" cy="144" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="50" cy="144" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="75" cy="144" r="2" fill="rgba(255,255,255,0.3)" />
        </svg>

        {/* Animated ring around hourglass */}
        {!isExpired && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Time Display */}
      <div className="text-center space-y-2">
        {isExpired ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-green-500"
          >
            ✨ Time's Up! ✨
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2">
              {timeLeft.days > 0 && (
                <TimeBlock value={timeLeft.days} label="days" />
              )}
              <TimeBlock value={timeLeft.hours} label="hrs" />
              <TimeBlock value={timeLeft.minutes} label="min" />
              <TimeBlock value={timeLeft.seconds} label="sec" />
            </div>
            <motion.p
              className="text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              until unlock
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-linear-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-lg px-3 py-2 min-w-[50px]"
      >
        <span className="text-xl font-bold text-amber-400 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

