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

/**
 * Swiss Minimal Architectural Perimeter Rule.
 * Preserves prop contract while rendering a crisp hairline structural border
 * instead of animated neon conic gradients.
 */
export default function BorderBeam({
  className = '',
  borderWidth = 1,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] z-[2] ${className}`}
      style={{
        border: `${borderWidth}px solid var(--border-strong)`,
        opacity: 0.25,
      }}
    />
  );
}
