'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Swiss skeleton element using semantic surface & border tokens.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-hud rounded-sm border border-border ${className}`}
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
        className={`p-6 sm:p-8 rounded-md bg-surface border border-border space-y-6 relative overflow-hidden ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="w-28 h-6" />
        </div>

        <div className="space-y-3">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-full h-14" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-sm bg-surface-elevated border border-border">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="w-36 h-10" />
          <Skeleton className="w-40 h-10" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="skeleton-card"
      className={`p-6 rounded-md bg-surface border border-border space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-24 h-5" />
      </div>

      <div className="space-y-2">
        <Skeleton className="w-4/5 h-6" />
        <Skeleton className="w-full h-10" />
      </div>

      <div className="space-y-2.5 pt-2 border-t border-border">
        <Skeleton className="w-2/3 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-28 h-8" />
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
      className={`w-full rounded-md bg-surface border border-border overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-32 h-6" />
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 shrink-0" />
              <Skeleton className="w-40 h-4" />
            </div>
            {Array.from({ length: Math.max(1, columns - 2) }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="hidden sm:block w-24 h-4" />
            ))}
            <Skeleton className="w-16 h-6 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Elo Leaderboard (Top 3 + Ranking Rows)
 */
export const SkeletonLeaderboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div data-testid="skeleton-leaderboard" className={`space-y-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="order-2 md:order-1 p-6 rounded-md bg-surface border border-border space-y-4 min-h-[220px]">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-16 h-16" />
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-full h-10" />
        </div>

        <div className="order-1 md:order-2 p-8 rounded-md bg-surface-elevated border border-border-strong space-y-5 min-h-[260px]">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-20 h-20" />
          <Skeleton className="w-4/5 h-7" />
          <Skeleton className="w-full h-12" />
        </div>

        <div className="order-3 p-6 rounded-md bg-surface border border-border space-y-4 min-h-[200px]">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-16 h-16" />
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>

      <SkeletonTable rows={8} columns={6} />
    </div>
  );
};

export default Skeleton;
