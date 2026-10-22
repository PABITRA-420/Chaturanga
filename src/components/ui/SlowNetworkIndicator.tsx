'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X, Sparkles } from 'lucide-react';

export default function SlowNetworkIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm p-3.5 rounded-2xl bg-[#12161D]/95 border border-[#D4AF7C]/40 shadow-2xl backdrop-blur-md text-[#F5F5F5] flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
            <span>Offline Resilience Active</span>
          </div>
          <p className="text-[11px] text-[#A0A6B0] leading-tight">
            Serving cached Swiss tournaments &amp; local standings.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A0A6B0] hover:text-white transition shrink-0"
        aria-label="Dismiss offline alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
