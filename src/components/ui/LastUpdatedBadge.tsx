'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface LastUpdatedBadgeProps {
  className?: string;
  showDetails?: boolean;
}

const LAST_UPDATED_DATE = 'November 10, 2026';
const BUILD_VERSION = 'v2.0.0';

export default function LastUpdatedBadge({
  className = '',
  showDetails = true,
}: LastUpdatedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface-elevated hover:border-border-strong border border-border text-fg-muted hover:text-fg text-[11px] transition-colors cursor-default select-none"
      >
        <span className="inline-flex rounded-full h-2 w-2 bg-success shrink-0" aria-hidden="true" />

        <span className="font-medium">
          Updated: <strong className="text-fg font-semibold">{LAST_UPDATED_DATE}</strong>
        </span>

        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-surface text-fg-muted border border-border">
          {BUILD_VERSION}
        </span>
      </div>

      {showDetails && showTooltip && (
        <div
          style={{ boxShadow: 'var(--shadow-md)' }}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 rounded-sm bg-surface border border-border-strong text-left text-xs z-50 pointer-events-none animate-scale-up"
        >
          <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Deployment Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
