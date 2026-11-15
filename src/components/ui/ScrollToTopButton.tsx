'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Minimal Swiss Scroll-to-Top Floating Button with Circular SVG Progress Ring.
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

        setIsVisible(scrollTop > 300);

        if (totalHeight > 0) {
          const progress = Math.min(Math.max(scrollTop / totalHeight, 0), 1);
          setScrollProgress(progress);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  // SVG circular geometry
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div
      className={`fixed bottom-36 md:bottom-20 right-5 sm:right-6 z-40 flex flex-row-reverse items-center transition-all duration-200 group ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        aria-label="Scroll back to top"
        data-testid="scroll-to-top-button"
        style={{ boxShadow: 'var(--shadow-sm)' }}
        className="relative w-11 h-11 rounded-full bg-surface hover:bg-surface-elevated border border-border hover:border-border-strong flex items-center justify-center transition-colors duration-150 cursor-pointer"
      >
        {/* Circular Progress SVG Ring */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        <ArrowUp className="w-4 h-4 text-fg group-hover:-translate-y-0.5 transition-transform duration-150" aria-hidden="true" />
      </button>

      {/* Desktop Hover Pill Label */}
      <span
        style={{ boxShadow: 'var(--shadow-sm)' }}
        className="hidden md:block pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 mr-2.5 px-2.5 py-1 rounded-xs bg-surface border border-border text-[10px] font-mono font-semibold tracking-wider text-fg-muted uppercase select-none whitespace-nowrap"
      >
        Top
      </span>
    </div>
  );
}
