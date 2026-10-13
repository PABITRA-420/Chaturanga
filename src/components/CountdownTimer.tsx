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

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 select-none">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[62px] py-2 px-2.5 rounded-xl bg-black/60 border border-[#D4AF7C]/30 shadow-inner backdrop-blur-md">
            <span className="font-['Montserrat',sans-serif] font-black text-lg sm:text-2xl text-[#D4AF7C] tabular-nums leading-none">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#A0A6B0] mt-1">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="text-[#D4AF7C]/60 font-bold text-lg sm:text-xl mx-0.5 sm:mx-1 animate-pulse">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
