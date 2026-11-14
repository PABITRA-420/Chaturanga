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
        className={`flex items-center gap-3 px-4 py-3 rounded-sm bg-surface border border-border text-accent ${className}`}
        data-testid="round-clock-draft"
      >
        <Hourglass className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-fg-muted">Round Status</div>
          <div className="text-sm font-semibold text-fg">Draft • Awaiting Arbiter Publication</div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-sm bg-surface border border-success/40 text-success ${className}`}
        data-testid="round-clock-completed"
      >
        <CheckCircle className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-success">Round Status</div>
          <div className="text-sm font-semibold text-fg">Round Completed • Results Certified</div>
        </div>
      </div>
    );
  }

  const startMs = startTime ? new Date(startTime).getTime() : now;
  const totalDurationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const elapsedMs = Math.max(0, now - startMs);
  const remainingMs = totalDurationMs - elapsedMs;

  const isOvertime = remainingMs < 0;
  const isUrgent = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

  useEffect(() => {
    if (isOvertime && onRoundExpired) {
      onRoundExpired();
    }
  }, [isOvertime, onRoundExpired]);

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
      className={`relative overflow-hidden rounded-sm bg-surface border p-4 sm:p-5 transition-colors duration-200 ${
        isOvertime
          ? 'border-danger'
          : isUrgent
          ? 'border-warning'
          : 'border-border-strong'
      } ${className}`}
      data-testid="round-clock-active"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Round Clock ({durationMinutes} Min)</span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span
              suppressHydrationWarning
              className={`font-mono font-extrabold text-2xl sm:text-3xl tracking-tight tabular-nums ${
                isOvertime
                  ? 'text-danger'
                  : isUrgent
                  ? 'text-warning'
                  : 'text-fg'
              }`}
            >
              {isOvertime ? `+${formattedTime}` : formattedTime}
            </span>

            {isOvertime && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs bg-danger/10 text-danger border border-danger/30">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Overtime
              </span>
            )}
            {!isOvertime && isUrgent && (
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs bg-warning/10 text-warning border border-warning/30">
                Time Trouble
              </span>
            )}
          </div>
        </div>

        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg aria-hidden="true" className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-border"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-500 ${
                isOvertime
                  ? 'text-danger'
                  : isUrgent
                  ? 'text-warning'
                  : 'text-accent'
              }`}
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3"
              strokeLinecap="butt"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute font-mono text-[10px] font-bold text-fg tabular-nums">
            {Math.round(progressPercent)}%
          </div>
        </div>
      </div>
    </div>
  );
};
