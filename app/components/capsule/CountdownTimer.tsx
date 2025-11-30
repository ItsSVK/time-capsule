"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTimestamp: number;
  onComplete?: () => void;
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  targetTimestamp,
  onComplete,
  label = "Opens in",
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / 86400),
        hours: Math.floor((difference % 86400) / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: difference % 60,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp, onComplete]);

  if (isComplete) {
    return (
      <div className={`text-emerald-400 font-semibold ${className}`}>
        ✓ Ready
      </div>
    );
  }

  const formatNumber = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</span>}
      <div className="flex items-center gap-1 font-mono text-lg">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} unit="d" />
            <span className="text-zinc-600">:</span>
          </>
        )}
        <TimeUnit value={timeLeft.hours} unit="h" />
        <span className="text-zinc-600">:</span>
        <TimeUnit value={timeLeft.minutes} unit="m" />
        <span className="text-zinc-600">:</span>
        <TimeUnit value={timeLeft.seconds} unit="s" />
      </div>
    </div>
  );
}

function TimeUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex items-baseline">
      <span className="tabular-nums">{value.toString().padStart(2, "0")}</span>
      <span className="text-xs text-zinc-500 ml-0.5">{unit}</span>
    </div>
  );
}

