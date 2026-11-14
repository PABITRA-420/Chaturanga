'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export default function SlowNetworkIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
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
      style={{ boxShadow: 'var(--shadow-md)' }}
      className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm p-3.5 rounded-sm bg-surface border border-warning/60 text-fg flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-sm bg-warning/10 border border-warning/30 flex items-center justify-center text-warning shrink-0">
          <WifiOff className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xs font-bold text-fg flex items-center gap-1.5">
            <span>Offline Resilience Active</span>
            <span className="text-[10px] font-mono text-warning font-normal">• Cached</span>
          </div>
          <p className="text-[11px] text-fg-muted leading-tight">
            Serving cached Swiss tournaments &amp; local standings. Passes saved safely offline.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="w-7 h-7 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border flex items-center justify-center text-fg-muted hover:text-fg transition shrink-0 btn-tactile"
        aria-label="Dismiss offline alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
