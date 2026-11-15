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
  color,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };

  const inlineStyle = color
    ? {
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
        borderTopColor: color,
        borderRightColor: color,
      }
    : undefined;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full animate-spin shrink-0 ${
        color ? '' : 'border-accent/25 border-t-accent border-r-accent'
      } ${sizeClasses[size]} ${className}`}
      style={inlineStyle}
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
  className = '',
}: ChessLoaderProps) {
  const containerSize = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }[size];

  const pieceSize = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}
    >
      <div className={`relative ${containerSize} rounded-sm bg-surface border border-border-strong flex items-center justify-center`}>
        <span className={`font-serif text-accent ${pieceSize}`} aria-hidden="true">
          {PIECE_SYMBOLS[piece]}
        </span>
      </div>

      {text ? (
        <div className="space-y-1.5 text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-fg font-heading">
            {text}
          </p>
          <div className="w-24 h-0.5 bg-border mx-auto overflow-hidden relative">
            <div className="w-full h-full bg-accent animate-shimmer" />
          </div>
        </div>
      ) : (
        <span className="sr-only">Loading chess data...</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
}
