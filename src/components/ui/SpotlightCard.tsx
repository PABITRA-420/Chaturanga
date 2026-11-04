'use client';

import React, { useRef, useCallback, ReactNode, HTMLAttributes } from 'react';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  size?: number;
  interactiveTilt?: boolean;
}

/**
 * High-Performance Hardware-Accelerated Spotlight Card.
 * Uses requestAnimationFrame and direct DOM transforms with 0 React re-renders on mousemove.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(212, 175, 124, 0.12)',
  size = 360,
  interactiveTilt = false,
  style,
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const target = e.currentTarget;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!target || !overlayRef.current) return;
      const rect = target.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      overlayRef.current.style.opacity = '1';
      overlayRef.current.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;

      if (interactiveTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rx = ((y - centerY) / centerY) * -3;
        const ry = ((x - centerX) / centerX) * 3;
        target.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      }
    });
  }, [size, spotlightColor, interactiveTilt]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0';
    }
    if (interactiveTilt && e.currentTarget) {
      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    }
  }, [interactiveTilt]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: interactiveTilt ? 'transform 0.15s ease-out' : undefined,
        transform: interactiveTilt ? 'perspective(1000px) translateZ(0)' : undefined,
        willChange: interactiveTilt ? 'transform' : undefined,
        ...style,
      }}
      className={`relative overflow-hidden group gpu-layer ${className}`}
      {...props}
    >
      {/* Hardware-Accelerated Radial Spotlight Overlay */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-1 opacity-0"
      />

      {/* Card Content & Overlays */}
      {children}
    </div>
  );
}
