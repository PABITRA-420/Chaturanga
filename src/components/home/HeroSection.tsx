'use client';

import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  ChevronRight,
  Crown
} from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

interface HeroSectionProps {
  participantsCount: number;
  eventsCount: number;
  peakElo?: number;
  featuredEvent: any;
  onRegisterClick: () => void;
}

export default function HeroSection({
  participantsCount,
  eventsCount,
  peakElo,
  featuredEvent,
  onRegisterClick,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const target = e.currentTarget;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!spotlightRef.current || !target) return;
      const rect = target.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      spotlightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  }, []);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="home" 
      className="relative w-full min-h-[640px] lg:min-h-[740px] flex items-center overflow-hidden border-b border-white/5"
    >
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.webp"
          alt="Chaturanga JGEC Chess King"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right-bottom filter brightness-[0.62] contrast-[1.15]"
        />
        {/* Cinematic Vignette and Dark Fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/90 to-transparent w-full lg:w-3/4" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0B0F14] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B0F14] to-transparent" />
      </div>

      {/* 21st.dev Interactive Cursor Spotlight Glow */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute w-[700px] h-[700px] rounded-full transition-opacity duration-500 z-1 gpu-layer"
        style={{
          left: 0,
          top: 0,
          transform: 'translate3d(300px, 300px, 0) translate(-50%, -50%)',
          willChange: 'transform',
          background: 'radial-gradient(circle, rgba(212,175,124,0.18) 0%, rgba(212,175,124,0.05) 35%, transparent 70%)',
          opacity: isHovered ? 1 : 0.4,
        }}
      />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-8">
          
          {/* Top Badge: Featured Tournament or Active Season with 21st.dev Pulsing Glow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-[#D4AF7C]/40 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,124,0.15)] max-w-full overflow-hidden hover:border-[#D4AF7C]/70 transition-colors">
            {featuredEvent && featuredEvent.title && !featuredEvent.isNeutral ? (
              <>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF7C] truncate max-w-[200px] sm:max-w-none">
                  Next Up: {featuredEvent.title}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#D4AF7C]/60 shrink-0" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A0A6B0] truncate max-w-[200px] sm:max-w-none">
                  {featuredEvent?.badgeText || 'Official Collegiate Chess Club'}
                </span>
              </>
            )}
            <span className="text-[#A0A6B0] text-xs shrink-0">• FIDE Rules</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="font-['Montserrat',sans-serif] font-black text-4xl sm:text-6xl lg:text-7xl text-[#F5F5F5] tracking-tight leading-[1.08]">
              STRATEGY. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] drop-shadow-[0_4px_24px_rgba(212,175,124,0.25)]">
                MASTERY.
              </span> <br />
              LEGACY.
            </h1>
            <p className="font-['Poppins',sans-serif] text-sm sm:text-base lg:text-lg text-[#A0A6B0] max-w-xl leading-relaxed">
              The official competitive chess club of Jalpaiguri Government Engineering College. Organizing certified Swiss championships, blitz arenas, and cultivating collegiate grandmasters since 2012.
            </p>
          </div>

          {/* Clear CTA Hierarchy with 21st.dev Shimmer Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            
            {/* PRIMARY CTA: 21st.dev Shimmer Button */}
            <ShimmerButton
              href="/register"
              className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-[#0B0F14]"
              shimmerColor="#FFFFFF"
              background="linear-gradient(135deg, #E6C98A 0%, #D4AF7C 50%, #C39958 100%)"
            >
              <span className="text-[#0B0F14] font-extrabold flex items-center gap-2">
                Register as Player
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0B0F14]" />
              </span>
            </ShimmerButton>

            {/* SUBDUED SECONDARY CTA: Explore Tournaments */}
            <Link
              href="/upcoming"
              className="px-7 py-4 rounded-full font-semibold text-xs uppercase tracking-widest text-[#F5F5F5] hover:text-[#D4AF7C] bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-[#D4AF7C]/50 flex items-center justify-center gap-2 group backdrop-blur-sm transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(212,175,124,0.15)] btn-tactile"
            >
              <span>Explore Tournaments</span>
              <ChevronRight className="w-4 h-4 text-[#A0A6B0] group-hover:text-[#D4AF7C] group-hover:translate-x-0.5 transition-all" />
            </Link>

          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:border-[#D4AF7C]/30 transition-colors">
              <div className="font-mono text-xl sm:text-3xl font-black text-[#D4AF7C] tabular-nums">
                {participantsCount > 0 ? `${participantsCount}+` : participantsCount}
              </div>
              <div className="text-[11px] sm:text-xs text-[#A0A6B0] uppercase font-medium mt-0.5">
                Competitors
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:border-white/20 transition-colors">
              <div className="font-mono text-xl sm:text-3xl font-black text-[#F5F5F5] tabular-nums">
                {eventsCount > 0 ? `${eventsCount}+` : eventsCount}
              </div>
              <div className="text-[11px] sm:text-xs text-[#A0A6B0] uppercase font-medium mt-0.5">
                Championships
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
              <div className="font-mono text-xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                {peakElo && peakElo > 0 ? peakElo : '—'}
              </div>
              <div className="text-[11px] sm:text-xs text-[#A0A6B0] uppercase font-medium mt-0.5">
                Peak Club Elo
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
