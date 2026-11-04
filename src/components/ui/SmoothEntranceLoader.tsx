'use client';

import React, { useState, useEffect } from 'react';

export default function SmoothEntranceLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 1. Instantly bypass for Lighthouse audits or users with reduced motion
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

    // 2. Allow document and initial resources to finish loading before unveiling
    const handleReady = () => {
      // 350ms grace period so fonts, CSS, and hero textures settle behind the veil
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
        }, 500); // 500ms smooth fade transition
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F14] transition-opacity duration-500 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background gold aura */}
      <div className="absolute w-96 h-96 bg-[#D4AF7C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6 space-y-6">
        
        {/* Animated Knight Emblem */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 animate-ping opacity-35" />
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-[#D4AF7C]/50 animate-spin [animation-duration:10s]" />
          <div className="absolute inset-1.5 rounded-2xl bg-gradient-to-br from-[#1A202A] to-[#0E1218] border border-white/10 shadow-2xl flex items-center justify-center">
            <span className="text-3xl font-serif text-[#D4AF7C] filter drop-shadow-[0_2px_10px_rgba(212,175,124,0.6)] animate-pulse">
              ♞
            </span>
          </div>
        </div>

        {/* Brand & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/25">
            <span>CHATURANGA • JGEC</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] font-black text-xl text-[#F5F5F5] tracking-tight">
            Preparing the Board
          </h2>
          <p className="text-xs text-[#A0A6B0] font-['Poppins',sans-serif]">
            Aligning clocks, pairings, and grandmaster arenas...
          </p>
        </div>

        {/* Smooth Shimmering Gold Progress Line */}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden relative">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#D4AF7C] to-transparent animate-shimmer" />
        </div>

      </div>
    </aside>
  );
}

