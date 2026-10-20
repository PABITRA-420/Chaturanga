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

    // Campus collegiate colors: Gold (#D4AF7C, #E6C98A), Emerald (#10B981), Cyan (#06B6D4)
    const colors = ['#D4AF7C', '#E6C98A', '#10B981', '#06B6D4', '#F5F5F5'];

    // Cannon 1: Left Burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.2, y: 0.65 },
      colors,
    });

    // Cannon 2: Right Burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.8, y: 0.65 },
      colors,
    });

    // Cannon 3: High Center Golden Shower
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
    // Graceful fallback for headless environments
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

  // Extract 1st, 2nd, 3rd place winners
  const first = winners[0];
  const second = winners[1];
  const third = winners[2];

  if (!first && !second && !third) return null;

  return (
    <div
      data-testid="podium-celebration"
      className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#141A24]/90 via-[#0E121A]/95 to-[#070A0E] border border-[#D4AF7C]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-8 ${className}`}
    >
      {/* Background radial gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#D4AF7C]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header with Title and Celebrate Button */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40 mb-2">
            <Crown className="w-3.5 h-3.5 text-[#D4AF7C]" />
            <span>Collegiate Arena Champions</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Montserrat',sans-serif] tracking-wide">
            {tournamentTitle ? `${tournamentTitle} • Podium Ceremony` : 'Tournament Grand Champions'}
          </h3>
          <p className="text-xs text-[#A0A6B0] mt-1">
            Official inter-department podium standings, cash prizes, and merit credentials.
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          aria-label="Celebrate Champions with golden confetti bursts"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] via-[#E6C98A] to-[#D4AF7C] hover:brightness-110 shadow-lg shadow-[#D4AF7C]/30 transition transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#0B0F14]" />
          <span>Celebrate Champions</span>
        </button>
      </div>

      {/* 3D-Style Podium Stand Display */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
        {/* 2nd Place (Silver - Left) */}
        {second && (
          <div
            data-testid="podium-card-silver"
            className="order-2 md:order-1 rounded-2xl p-5 bg-[#10141C]/80 border border-slate-300/30 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-300/50 transition-all duration-300 md:min-h-[220px]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-300/20 text-slate-200 border border-slate-300/30">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                <span>2nd (Silver)</span>
              </span>
              {second.rating && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-[#A0A6B0] border border-white/10">
                  Rating: {second.rating}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white truncate" title={second.name}>
                {second.name || 'Runner Up'}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {second.dept ? `Dept: ${second.dept}` : 'Collegiate Contender'}
              </p>
              {second.score && (
                <p className="text-xs font-mono text-[#A0A6B0]">
                  Score: <span className="text-white font-bold">{second.score}</span>
                </p>
              )}
            </div>

            {second.prize && (
              <div className="pt-2 border-t border-white/10 text-xs font-semibold text-slate-300">
                Prize: {second.prize}
              </div>
            )}
          </div>
        )}

        {/* 1st Place (Gold Champion - Center Elevated) */}
        {first && (
          <div
            data-testid="podium-card-gold"
            className="order-1 md:order-2 rounded-2xl p-6 bg-gradient-to-b from-[#D4AF7C]/20 via-[#141A24]/90 to-[#0B0F14] border-2 border-[#D4AF7C] flex flex-col justify-between space-y-4 shadow-2xl shadow-[#D4AF7C]/20 hover:shadow-[#D4AF7C]/30 transition-all duration-300 md:min-h-[260px] md:-translate-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/40">
                <Trophy className="w-4 h-4 text-[#0B0F14]" />
                <span>1st (Grand Champion)</span>
              </span>
              {first.rating && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF7C]/20 text-[#D4AF7C] font-bold border border-[#D4AF7C]/30">
                  Rating: {first.rating}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl sm:text-2xl font-black text-[#F5F5F5] truncate" title={first.name}>
                {first.name || 'Grand Champion'}
              </h4>
              <p className="text-xs text-[#D4AF7C] font-bold tracking-wide">
                {first.dept ? `Department of ${first.dept}` : 'Inter-Department Champion'}
              </p>
              {first.score && (
                <p className="text-xs font-mono text-[#A0A6B0]">
                  Final Score: <span className="text-[#F5F5F5] font-bold text-sm">{first.score}</span>
                </p>
              )}
            </div>

            {first.prize && (
              <div className="pt-2.5 border-t border-[#D4AF7C]/30 text-xs font-bold text-[#E6C98A] flex items-center justify-between">
                <span>Award:</span>
                <span>{first.prize}</span>
              </div>
            )}
          </div>
        )}

        {/* 3rd Place (Bronze - Right) */}
        {third && (
          <div
            data-testid="podium-card-bronze"
            className="order-3 rounded-2xl p-5 bg-[#10141C]/80 border border-amber-700/40 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-700/60 transition-all duration-300 md:min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-700/20 text-amber-400 border border-amber-700/40">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>3rd (Bronze)</span>
              </span>
              {third.rating && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-[#A0A6B0] border border-white/10">
                  Rating: {third.rating}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white truncate" title={third.name}>
                {third.name || '2nd Runner Up'}
              </h4>
              <p className="text-xs text-amber-500 font-medium">
                {third.dept ? `Dept: ${third.dept}` : 'Collegiate Contender'}
              </p>
              {third.score && (
                <p className="text-xs font-mono text-[#A0A6B0]">
                  Score: <span className="text-white font-bold">{third.score}</span>
                </p>
              )}
            </div>

            {third.prize && (
              <div className="pt-2 border-t border-white/10 text-xs font-semibold text-amber-400">
                Prize: {third.prize}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodiumCelebration;
