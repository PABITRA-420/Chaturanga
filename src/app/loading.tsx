'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4 selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full p-8 rounded-3xl bg-[#12161D]/90 border border-[#D4AF7C]/20 shadow-2xl backdrop-blur-xl text-center space-y-6">
        
        {/* Animated Emblem */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-3xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/40 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1C222C] to-[#0E1218] border border-[#D4AF7C]/30 shadow-lg flex items-center justify-center">
            <span className="text-3xl select-none filter drop-shadow-[0_2px_8px_rgba(212,175,124,0.4)]">
              ♞
            </span>
          </div>
        </div>
        
        {/* Loading text with collegiate flair */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/25">
            <span>CHATURANGA • JGEC</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] font-black text-lg text-[#F5F5F5] tracking-tight">
            Preparing the Board
          </h2>
          <p className="text-xs text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed">
            Calibrating Swiss pairings, live ratings, and collegiate tournament tables...
          </p>
        </div>

        {/* Shimmering Gold Progress Bar */}
        <div className="w-48 h-1.5 rounded-full bg-white/10 mx-auto overflow-hidden relative">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] shadow-[0_0_12px_#D4AF7C]"
            style={{
              animation: 'chaturanga-progress 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes chaturanga-progress {
            0% { width: 0%; margin-left: 0; }
            50% { width: 75%; margin-left: 15%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>

      </div>
    </div>
  );
}
