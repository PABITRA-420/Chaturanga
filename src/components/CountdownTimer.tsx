"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getInitialTimeRemaining(targetDate: string): TimeRemaining {
  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }
  const targetTime = new Date(targetDate).getTime();
  if (isNaN(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }
  const difference = targetTime - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
  };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => getInitialTimeRemaining(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      setTimeLeft(getInitialTimeRemaining(targetDate));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div suppressHydrationWarning className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs bg-danger/10 border border-danger/40 text-xs font-mono font-semibold text-danger">
        <span className="w-2 h-2 rounded-full bg-danger shrink-0" aria-hidden="true" />
        <span>Event Live or Concluded</span>
      </div>
    );
  }

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <div suppressHydrationWarning className="flex flex-wrap items-center gap-2 sm:gap-3 select-none">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] py-2 px-2.5 rounded-sm bg-surface border border-border">
            <span
              suppressHydrationWarning
              className="font-mono font-bold text-lg sm:text-2xl text-accent tabular-nums leading-none"
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-fg-muted mt-1.5">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="text-fg-muted font-mono font-bold text-lg sm:text-xl mx-0.5 sm:mx-1">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
