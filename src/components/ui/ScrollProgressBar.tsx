'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Award-Winning Hairline Gold Scroll Progress Bar
 * Uses hardware-accelerated transform3d with zero React re-renders on scroll.
 */
export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (!barRef.current) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) {
          barRef.current.style.transform = 'scaleX(0)';
          return;
        }
        const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        barRef.current.style.transform = `scaleX(${progress})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      suppressHydrationWarning
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        data-testid="scroll-progress-bar"
        className="h-full w-full bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] origin-left shadow-[0_0_10px_rgba(212,175,124,0.7)] transition-transform duration-75 ease-out"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
