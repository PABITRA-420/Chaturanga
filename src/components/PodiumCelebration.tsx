'use client';

import React, { useEffect, useCallback } from 'react';
import { Trophy, Award, Medal, Sparkles, Crown } from 'lucide-react';
import { TournamentPodiumItem } from '@/types/tournament';

export interface PodiumWinner extends Partial<TournamentPodiumItem> {
  rank: string;
  name: string;
  dept?: string;
  score?: string;
  prize?: string;
  rating?: number | string;
}

export interface PodiumCelebrationProps {
  winners: PodiumWinner[];
  tournamentTitle?: string;
  autoTrigger?: boolean;
  className?: string;
}

export const fireGoldenConfetti = async () => {
  if (typeof window === 'undefined') return;

  try {
    const mod = await import('canvas-confetti');
    const confetti = mod.default || mod;

    const colors = ['#D4AF7C', '#8F6415', '#10B981', '#1D4ED8', '#FAFAFA'];

    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.2, y: 0.65 },
      colors,
    });

    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.8, y: 0.65 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 75,
        spread: 100,
        origin: { x: 0.5, y: 0.35 },
        colors,
        gravity: 0.8,
        ticks: 250,
      });
    }, 200);
  } catch (err) {
    console.debug('Confetti effect bypassed in current environment:', err);
  }
};

export const PodiumCelebration: React.FC<PodiumCelebrationProps> = ({
  winners,
  tournamentTitle,
  autoTrigger = false,
  className = '',
}) => {
  const triggerConfetti = useCallback(() => {
    fireGoldenConfetti();
  }, []);

  useEffect(() => {
    if (autoTrigger && winners.some((w) => Boolean(w.name?.trim()))) {
      triggerConfetti();
    }
  }, [autoTrigger, winners, triggerConfetti]);

  const first = winners[0];
  const second = winners[1];
  const third = winners[2];

  if (!first && !second && !third) return null;

  return (
    <div
      data-testid="podium-celebration"
      className={`rounded-md p-6 sm:p-8 bg-surface border border-border-strong relative overflow-hidden space-y-8 ${className}`}
    >
      {/* Header with Title and Celebrate Button */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em] mb-1.5">
            <Crown className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Collegiate Arena Champions</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-fg font-heading tracking-tight">
            {tournamentTitle ? `${tournamentTitle} • Podium Ceremony` : 'Tournament Grand Champions'}
          </h3>
          <p className="text-xs text-fg-muted font-body mt-1">
            Official inter-department podium standings, cash prizes, and merit credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerConfetti}
          aria-label="Celebrate Champions with golden confetti bursts"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer btn-tactile"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>Celebrate Champions</span>
        </button>
      </div>

      {/* Podium Stand Display */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
        {/* 2nd Place (Silver) */}
        {second && (
          <div
            data-testid="podium-card-silver"
            className="order-2 md:order-1 rounded-sm p-5 bg-surface-elevated border border-border flex flex-col justify-between space-y-4 md:min-h-[210px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-surface text-fg border border-border">
                <Medal className="w-3.5 h-3.5 text-fg-muted" aria-hidden="true" />
                <span>2nd (Silver)</span>
              </span>
              {second.rating && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-xs bg-surface text-fg-muted border border-border">
                  Rating: {second.rating}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-fg font-heading truncate" title={second.name}>
                {second.name || 'Runner Up'}
              </h4>
              <p className="text-xs text-fg-muted font-mono">
                {second.dept ? `Dept: ${second.dept}` : 'Collegiate Contender'}
              </p>
              {second.score && (
                <p className="text-xs font-mono text-fg-muted">
                  Score: <span className="text-fg font-bold">{second.score}</span>
                </p>
              )}
            </div>

            {second.prize && (
              <div className="pt-2 border-t border-border text-xs font-mono font-semibold text-fg">
                Prize: {second.prize}
              </div>
            )}
          </div>
        )}

        {/* 1st Place (Champion) */}
        {first && (
          <div
            data-testid="podium-card-gold"
            className="order-1 md:order-2 rounded-sm p-6 bg-surface-elevated border-2 border-accent flex flex-col justify-between space-y-4 md:min-h-[250px] relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-mono font-extrabold bg-accent text-on-accent">
                <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>1st (Grand Champion)</span>
              </span>
              {first.rating && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-xs bg-surface text-accent font-bold border border-accent/40">
                  Rating: {first.rating}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-extrabold text-fg font-heading truncate" title={first.name}>
                {first.name || 'Grand Champion'}
              </h4>
              <p className="text-xs text-accent font-mono font-bold tracking-wide">
                {first.dept ? `Department of ${first.dept}` : 'Inter-Department Champion'}
              </p>
              {first.score && (
                <p className="text-xs font-mono text-fg-muted">
                  Final Score: <span className="text-fg font-bold text-sm">{first.score}</span>
                </p>
              )}
            </div>

            {first.prize && (
              <div className="pt-2.5 border-t border-border text-xs font-mono font-bold text-accent flex items-center justify-between">
                <span>Award:</span>
                <span>{first.prize}</span>
              </div>
            )}
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <div
            data-testid="podium-card-bronze"
            className="order-3 rounded-sm p-5 bg-surface-elevated border border-warning/40 flex flex-col justify-between space-y-4 md:min-h-[195px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-warning/10 text-warning border border-warning/30">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                <span>3rd (Bronze)</span>
              </span>
              {third.rating && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-xs bg-surface text-fg-muted border border-border">
                  Rating: {third.rating}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-fg font-heading truncate" title={third.name}>
                {third.name || '2nd Runner Up'}
              </h4>
              <p className="text-xs text-warning font-mono font-medium">
                {third.dept ? `Dept: ${third.dept}` : 'Collegiate Contender'}
              </p>
              {third.score && (
                <p className="text-xs font-mono text-fg-muted">
                  Score: <span className="text-fg font-bold">{third.score}</span>
                </p>
              )}
            </div>

            {third.prize && (
              <div className="pt-2 border-t border-border text-xs font-mono font-semibold text-warning">
                Prize: {third.prize}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
