'use client';

import React, { ReactNode, HTMLAttributes } from 'react';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  size?: number;
  interactiveTilt?: boolean;
}

/**
 * Swiss Minimal Architectural Card Container.
 * Preserves SpotlightCard prop contract while enforcing crisp hairline borders,
 * subtle hover elevation, and zero runtime mousemove reflow/tilt overhead.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor: _spotlightColor,
  size: _size,
  interactiveTilt: _interactiveTilt,
  style,
  ...props
}: SpotlightCardProps) {
  return (
    <div
      style={style}
      className={`relative overflow-hidden group transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
