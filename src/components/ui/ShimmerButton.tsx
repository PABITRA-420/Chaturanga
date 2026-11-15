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

/**
 * Crisp Swiss High-Contrast Primary Action Button.
 * Retains ShimmerButton API for seamless component compatibility while removing
 * noisy conic animations and metallic glow blurs in favor of sharp contrast.
 */
export default function ShimmerButton({
  children,
  href,
  className = '',
  shimmerColor: _shimmerColor,
  borderRadius = '2px',
  shimmerDuration: _shimmerDuration,
  background: _background,
  onClick,
  disabled,
  type = 'button',
  ...props
}: ShimmerButtonProps) {
  const sharedClasses = `group relative inline-flex items-center justify-center px-7 py-3.5 bg-accent hover:bg-accent-hover text-on-accent border border-accent font-ui font-bold text-xs uppercase tracking-widest transition-colors duration-150 btn-tactile ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={sharedClasses}
        style={{ borderRadius }}
      >
        <span className="flex items-center justify-center gap-2">
          {children}
        </span>
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
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
