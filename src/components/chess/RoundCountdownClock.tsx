'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Hourglass } from 'lucide-react';

export interface RoundCountdownClockProps {
  startTime?: string | null;
  durationMinutes?: number;
  status?: 'draft' | 'published' | 'in_progress' | 'completed';
  onRoundExpired?: () => void;
  className?: string;
}

export const RoundCountdownClock: React.FC<RoundCountdownClockProps> = ({
  startTime = null,
  durationMinutes = 60,
  status = 'published',
  onRoundExpired,
  className = '',
}) => {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (status !== 'published' && status !== 'in_progress') return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  if (status === 'draft') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#12161F] border border-amber-500/20 text-[#D4AF7C] ${className}`}
        data-testid="round-clock-draft"
      >
        <Hourglass className="w-5 h-5 text-[#D4AF7C] animate-pulse shrink-0" />
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#A0A6B0]">Round Status</div>
          <div className="text-sm font-semibold text-white">Draft • Awaiting Arbiter Publication</div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0F1C18] border border-emerald-500/30 text-emerald-400 ${className}`}
        data-testid="round-clock-completed"
      >
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-500/80">Round Status</div>
          <div className="text-sm font-semibold text-emerald-200">Round Completed • Results Certified</div>
        </div>
      </div>
    );
  }

  // Active or In-Progress Round
  const startMs = startTime ? new Date(startTime).getTime() : now;
  const totalDurationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const elapsedMs = Math.max(0, now - startMs);
  const remainingMs = totalDurationMs - elapsedMs;

  const isOvertime = remainingMs < 0;
  const isUrgent = remainingMs > 0 && remainingMs <= 5 * 60 * 1000; // Under 5 minutes

  // Trigger round expired callback once
  useEffect(() => {
    if (isOvertime && onRoundExpired) {
      onRoundExpired();
    }
  }, [isOvertime, onRoundExpired]);

  // Format MM:SS or HH:MM:SS
  const absRemainingSeconds = Math.floor(Math.abs(remainingMs) / 1000);
  const hours = Math.floor(absRemainingSeconds / 3600);
  const minutes = Math.floor((absRemainingSeconds % 3600) / 60);
  const seconds = absRemainingSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedTime =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  const progressPercent = isOvertime
    ? 0
    : Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131720] to-[#0A0D13] border p-4 sm:p-5 shadow-xl transition-all duration-300 ${
        isOvertime
          ? 'border-red-500/50 shadow-red-950/30'
          : isUrgent
          ? 'border-amber-500/50 shadow-amber-950/20 animate-pulse'
          : 'border-[#D4AF7C]/30'
      } ${className}`}
      data-testid="round-clock-active"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#D4AF7C]">
            <Clock className="w-3.5 h-3.5" />
            <span>Round Clock ({durationMinutes} Min)</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono font-black text-2xl sm:text-3xl tracking-tight ${
                isOvertime
                  ? 'text-red-400'
                  : isUrgent
                  ? 'text-amber-300'
                  : 'text-white'
              }`}
            >
              {isOvertime ? `+${formattedTime}` : formattedTime}
            </span>

            {isOvertime && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                <AlertTriangle className="w-3 h-3" /> Overtime
              </span>
            )}
            {!isOvertime && isUrgent && (
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Time Trouble
              </span>
            )}
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white/10"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-500 ${
                isOvertime
                  ? 'text-red-500'
                  : isUrgent
                  ? 'text-amber-400'
                  : 'text-[#D4AF7C]'
              }`}
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute font-mono text-[10px] font-bold text-slate-300">
            {Math.round(progressPercent)}%
          </div>
        </div>
      </div>
    </div>
  );
};
