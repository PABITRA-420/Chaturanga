'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Award-Winning Scroll-to-Top Floating Button with Circular SVG Progress Ring.
 * Inspired by Awwwards Site of the Year and high-end interactive portfolios.
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

        // Toggle visibility past 300px
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
      className={`fixed bottom-36 md:bottom-20 right-5 sm:right-6 z-40 flex flex-row-reverse items-center transition-all duration-300 group ${
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
        className="relative w-11 h-11 rounded-full bg-[#12161D]/90 hover:bg-[#181D26] backdrop-blur-md border border-[#D4AF7C]/30 hover:border-[#D4AF7C] shadow-2xl flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,124,0.35)] active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF7C]/50"
      >
        {/* Circular Progress SVG Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 44 44"
        >
          {/* Subtle background track */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-white/10"
          />
          {/* Active gold progress indicator */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="#D4AF7C"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        {/* Center Golden Arrow with micro-lift animation on hover */}
        <ArrowUp className="w-4 h-4 text-[#D4AF7C] group-hover:-translate-y-0.5 transition-transform duration-200" />
      </button>

      {/* Desktop Hover Pill Label */}
      <span className="hidden md:block pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-2.5 px-2.5 py-1 rounded-full bg-[#12161D]/90 border border-[#D4AF7C]/20 text-[10px] font-semibold tracking-wider text-[#A0A6B0] uppercase shadow-lg select-none whitespace-nowrap">
        Top
      </span>
    </div>
  );
}

