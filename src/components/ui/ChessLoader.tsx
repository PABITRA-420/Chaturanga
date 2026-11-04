'use client';

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  color = '#D4AF7C'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-t-transparent animate-spin shrink-0 ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: `${color} transparent transparent transparent`,
        borderRightColor: color,
        borderBottomColor: `${color}33`,
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface ChessLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  piece?: 'knight' | 'king' | 'queen' | 'rook';
  fullScreen?: boolean;
  className?: string;
}

const PIECE_SYMBOLS = {
  knight: '♞',
  king: '♚',
  queen: '♛',
  rook: '♜',
};

export default function ChessLoader({
  size = 'md',
  text,
  piece = 'knight',
  fullScreen = false,
  className = ''
}: ChessLoaderProps) {
  const containerSize = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }[size];

  const pieceSize = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}
    >
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Pulsing outer aura */}
        <div className="absolute inset-0 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 animate-ping opacity-40" />

        {/* Outer rotating golden dashed ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#D4AF7C]/60 animate-spin [animation-duration:8s]" />

        {/* Core frosted dark tile */}
        <div className="absolute inset-1.5 rounded-xl bg-gradient-to-br from-[#1C222C] to-[#0E1218] border border-white/10 shadow-xl flex items-center justify-center">
          {/* Animated bouncing chess piece */}
          <span
            className={`font-serif text-[#D4AF7C] ${pieceSize} animate-pulse drop-shadow-[0_2px_8px_rgba(212,175,124,0.5)]`}
          >
            {PIECE_SYMBOLS[piece]}
          </span>
        </div>
      </div>

      {text ? (
        <div className="space-y-1 text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#F5F5F5] font-['Montserrat',sans-serif]">
            {text}
          </p>
          <div className="w-20 h-0.5 rounded-full bg-white/10 mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#D4AF7C] to-transparent animate-shimmer" />
          </div>
        </div>
      ) : (
        <span className="sr-only">Loading chess data...</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F14]/85 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
}
