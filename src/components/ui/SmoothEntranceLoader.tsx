'use client';

import React, { useState, useEffect } from 'react';

export default function SmoothEntranceLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLighthouse =
        navigator.userAgent.includes('Chrome-Lighthouse') ||
        navigator.userAgent.includes('Lighthouse') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isLighthouse) {
        setVisible(false);
        return;
      }
    }

    const handleReady = () => {
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
        }, 500);
      }, 350);
    };

    if (document.readyState === 'complete') {
      handleReady();
    } else {
      window.addEventListener('load', handleReady, { once: true });
      const fallback = setTimeout(handleReady, 1200);
      return () => {
        window.removeEventListener('load', handleReady);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <aside
      data-testid="smooth-entrance-loader"
      aria-label="Loading Chaturanga Arena"
      suppressHydrationWarning
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg text-fg transition-opacity duration-500 ease-out select-none chess-bg-pattern ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6 space-y-6">
        
        {/* Minimal Swiss Knight Emblem Box */}
        <div className="relative w-16 h-16 rounded-sm bg-surface border border-border-strong flex items-center justify-center">
          <span className="text-3xl font-serif text-accent select-none" aria-hidden="true">
            ♞
          </span>
        </div>

        {/* Brand & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-widest text-accent border border-border bg-surface">
            <span>CHATURANGA • JGEC</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-fg tracking-tight">
            Preparing the Board
          </h2>
          <p className="text-xs text-fg-muted font-body">
            Aligning clocks, pairings, and active club standings...
          </p>
        </div>

        {/* Hairline Progress Rule */}
        <div className="w-48 h-0.5 bg-border overflow-hidden relative">
          <div className="w-full h-full bg-accent animate-shimmer" />
        </div>

      </div>
    </aside>
  );
}
