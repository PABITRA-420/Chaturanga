'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base shimmering obsidian & collegiate gold skeleton element
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-hud rounded-xl border border-white/5 ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton for Tournament & Match Cards (0 Cumulative Layout Shift)
 */
export const SkeletonCard: React.FC<{ isFeatured?: boolean; className?: string }> = ({
  isFeatured = false,
  className = '',
}) => {
  if (isFeatured) {
    return (
      <div
        data-testid="skeleton-featured-card"
        className={`p-6 sm:p-8 rounded-3xl bg-[#12161D]/80 border border-[#D4AF7C]/20 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
          </div>
          <Skeleton className="w-28 h-6 rounded-full" />
        </div>

        <div className="space-y-3">
          <Skeleton className="w-3/4 h-8 rounded-xl" />
          <Skeleton className="w-full h-14 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B0F14]/60 border border-white/5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="w-36 h-10 rounded-full" />
          <Skeleton className="w-40 h-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="skeleton-card"
      className={`p-6 rounded-3xl bg-[#12161D]/70 border border-white/10 space-y-5 backdrop-blur-md shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-24 h-5 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="w-4/5 h-6 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>

      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <Skeleton className="w-2/3 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-24 h-8 rounded-full" />
        <Skeleton className="w-28 h-8 rounded-full" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Tables (Pairings, Roster, Crosstables)
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 5,
  className = '',
}) => {
  return (
    <div
      data-testid="skeleton-table"
      className={`w-full rounded-2xl bg-[#10141C]/80 border border-white/10 overflow-hidden backdrop-blur-md ${className}`}
    >
      {/* Table Header Bar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <Skeleton className="w-48 h-6 rounded-lg" />
        <Skeleton className="w-32 h-6 rounded-lg" />
      </div>

      {/* Row Items */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
              <Skeleton className="w-40 h-4 rounded" />
            </div>
            {Array.from({ length: Math.max(1, columns - 2) }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="hidden sm:block w-24 h-4 rounded" />
            ))}
            <Skeleton className="w-16 h-6 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Elo Leaderboard (Top 3 Crowns + Ranking Rows)
 */
export const SkeletonLeaderboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div data-testid="skeleton-leaderboard" className={`space-y-8 ${className}`}>
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Silver #2 */}
        <div className="order-2 md:order-1 p-6 rounded-3xl bg-[#12161D]/80 border border-slate-300/20 space-y-4 min-h-[220px]">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <Skeleton className="w-3/4 h-6 rounded" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>

        {/* Gold #1 */}
        <div className="order-1 md:order-2 p-8 rounded-3xl bg-[#181D26]/90 border-2 border-[#D4AF7C]/40 space-y-5 min-h-[260px] md:-translate-y-3">
          <Skeleton className="w-32 h-6 rounded-full" />
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <Skeleton className="w-4/5 h-7 rounded" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>

        {/* Bronze #3 */}
        <div className="order-3 p-6 rounded-3xl bg-[#12161D]/80 border border-amber-700/30 space-y-4 min-h-[200px]">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <Skeleton className="w-3/4 h-6 rounded" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <SkeletonTable rows={8} columns={6} />
    </div>
  );
};

export default Skeleton;
