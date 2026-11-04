'use client';

import React from 'react';

interface BorderBeamProps {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  baseColor?: string;
  borderWidth?: number;
  reverse?: boolean;
}

export default function BorderBeam({
  className = '',
  duration = 8,
  colorFrom = '#D4AF7C',
  colorTo = '#F3E2B8',
  baseColor = 'rgba(212, 175, 124, 0.25)',
  borderWidth = 2,
  reverse = false,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-[2] ${className}`}
      style={{
        padding: `${borderWidth}px`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
      }}
    >
      {/* 1. Ambient base border outline across the outer perimeter (replaces static CSS border) */}
      {baseColor && (
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{ background: baseColor }}
        />
      )}

      {/* 2. Traveling Shimmer Beam running seamlessly through the exact outer border */}
      <div
        className={`absolute -inset-[150%] ${reverse ? 'animate-spin-reverse' : 'animate-spin'}`}
        style={{
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          background: `conic-gradient(from 0deg, transparent 0 290deg, ${colorFrom} 335deg, ${colorTo} 360deg)`,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
