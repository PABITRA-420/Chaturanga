'use client';

import React, { useState } from 'react';
import { Calendar, ShieldCheck, RefreshCw } from 'lucide-react';

export interface LastUpdatedBadgeProps {
  className?: string;
  showDetails?: boolean;
}

// Fixed or build-time dynamic date reflecting latest site deployment
const LAST_UPDATED_DATE = 'November 4, 2026';
const BUILD_VERSION = 'v1.0.4';

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
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#D4AF7C]/40 text-[#A0A6B0] hover:text-[#F5F5F5] text-[11px] transition-all cursor-default select-none shadow-sm"
      >
        {/* Pulsing live status dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <span className="font-medium">
          Site Updated: <strong className="text-[#D4AF7C] font-semibold">{LAST_UPDATED_DATE}</strong>
        </span>

        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-[#A0A6B0] border border-white/5">
          {BUILD_VERSION}
        </span>
      </div>

      {/* Hover Info Tooltip */}
      {showDetails && showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl bg-[#12161D] border border-[#D4AF7C]/30 shadow-2xl backdrop-blur-xl text-left text-xs space-y-1.5 z-50 pointer-events-none animate-scale-up">
          <div className="flex items-center gap-1.5 text-[#D4AF7C] font-bold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deployment Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}

