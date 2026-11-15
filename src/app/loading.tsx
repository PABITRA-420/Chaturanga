'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-4 selection:bg-accent selection:text-on-accent chess-bg-pattern">
      <div className="relative z-10 max-w-sm w-full p-8 rounded-md bg-surface border border-border text-center space-y-6">
        
        {/* Minimal Geometric Chess Emblem */}
        <div className="relative w-16 h-16 mx-auto border border-border-strong rounded-sm bg-surface-elevated flex items-center justify-center">
          <span className="text-3xl select-none text-accent" aria-hidden="true">
            ♞
          </span>
        </div>
        
        {/* Loading text with Swiss grid hierarchy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold uppercase tracking-widest text-accent border border-border">
            <span>CHATURANGA • JGEC</span>
          </div>
          <h2 className="font-heading font-bold text-lg text-fg tracking-tight">
            Setting Up the Board
          </h2>
          <p className="text-xs text-fg-muted font-body leading-relaxed">
            Calibrating tournament clocks, Swiss pairings, and active club standings...
          </p>
        </div>

        {/* Hairline Progress Indicator */}
        <div className="w-48 h-0.5 bg-border mx-auto overflow-hidden relative">
          <div
            className="h-full bg-accent"
            style={{
              animation: 'chaturanga-progress 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes chaturanga-progress {
            0% { width: 0%; margin-left: 0; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>

      </div>
    </div>
  );
}
