'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
  className?: string;
  shimmerColor?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export default function ShimmerButton({
  children,
  href,
  className = '',
  shimmerColor = '#FFFFFF',
  borderRadius = '9999px',
  shimmerDuration = '3s',
  background = 'linear-gradient(135deg, #E6C98A 0%, #D4AF7C 50%, #C39958 100%)',
  onClick,
  disabled,
  type = 'button',
  ...props
}: ShimmerButtonProps) {
  const innerContent = (
    <>
      {/* 21st.dev Sparkle/Conic Shimmer Rotating Layer */}
      <div
        className="pointer-events-none absolute -inset-[100%] animate-[spin_3s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 68%, ${shimmerColor} 82%, transparent 100%)`,
          animationDuration: shimmerDuration,
        }}
      />

      {/* Button Surface Mask */}
      <div
        className="absolute inset-[1.5px] z-10 flex items-center justify-center transition-all duration-200"
        style={{
          borderRadius: `calc(${borderRadius} - 1.5px)`,
          background,
        }}
      />

      {/* Ambient Halo Glow behind the button */}
      <div
        className="pointer-events-none absolute -inset-0.5 z-0 opacity-40 blur-sm transition-opacity duration-300 group-hover:opacity-80"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,124,0.4) 0%, rgba(243,226,184,0.6) 50%, rgba(212,175,124,0.4) 100%)',
          borderRadius,
        }}
      />

      {/* Foreground Content - Clean and flexible without forced font-mono */}
      <span className="relative z-20 flex items-center justify-center gap-2 transition-transform duration-150">
        {children}
      </span>
    </>
  );

  const sharedClasses = `group relative inline-flex items-center justify-center overflow-hidden px-8 py-3.5 shadow-lg shadow-[#D4AF7C]/25 transition-all duration-200 hover:shadow-[#D4AF7C]/40 btn-tactile ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={sharedClasses}
        style={{ borderRadius }}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={sharedClasses}
      style={{ borderRadius }}
      {...props}
    >
      {innerContent}
    </button>
  );
}
