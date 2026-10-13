'use client';

import React from 'react';
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

interface HeroSectionProps {
  participantsCount: number;
  eventsCount: number;
  featuredEvent: any;
  onRegisterClick: () => void;
}

export default function HeroSection({
  participantsCount,
  eventsCount,
  featuredEvent,
  onRegisterClick,
}: HeroSectionProps) {
  return (
    <section 
      id="home" 
      className="relative w-full min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-white/5"
    >
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt="Chaturanga JGEC Chess King"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right-bottom filter brightness-[0.65] contrast-[1.12]"
        />
        {/* Cinematic Vignette and Dark Fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/90 to-transparent w-full lg:w-3/4" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0F14] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B0F14] to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-8">
          
          {/* Top Badge: Featured Tournament or Active Season */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#D4AF7C]/30 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF7C]">
              {featuredEvent?.title ? `Next Up: ${featuredEvent.title}` : 'Spring Season 2026 Live'}
            </span>
            <span className="text-[#A0A6B0] text-xs">• FIDE Rules</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="font-['Montserrat',sans-serif] font-black text-4xl sm:text-6xl lg:text-7xl text-[#F5F5F5] tracking-tight leading-[1.08]">
              STRATEGY. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C]">
                MASTERY.
              </span> <br />
              LEGACY.
            </h1>
            <p className="font-['Poppins',sans-serif] text-sm sm:text-base lg:text-lg text-[#A0A6B0] max-w-xl leading-relaxed">
              The official competitive chess club of Jalpaiguri Government Engineering College. Organizing certified Swiss championships, blitz arenas, and cultivating collegiate grandmasters since 2012.
            </p>
          </div>

          {/* Clear CTA Hierarchy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            
            {/* PRIMARY CTA: Register as Player (High-contrast gold glow) */}
            <Link
              href="/register"
              className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-lg shadow-[#D4AF7C]/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Register as Player</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* SUBDUED SECONDARY CTA: Explore Tournaments (Ghost/outline) */}
            <Link
              href="/upcoming"
              className="px-7 py-4 rounded-full font-semibold text-xs uppercase tracking-widest text-[#F5F5F5] hover:text-[#D4AF7C] bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-[#D4AF7C]/40 transition-all flex items-center justify-center gap-2 group backdrop-blur-sm"
            >
              <span>Explore Tournaments</span>
              <ChevronRight className="w-4 h-4 text-[#A0A6B0] group-hover:text-[#D4AF7C] group-hover:translate-x-0.5 transition-all" />
            </Link>

          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
            <div>
              <div className="font-mono text-xl sm:text-3xl font-black text-[#D4AF7C]">
                {participantsCount}+
              </div>
              <div className="text-[11px] sm:text-xs text-[#A0A6B0] uppercase font-medium mt-0.5">
                Competitors
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-3xl font-black text-[#F5F5F5]">
                {eventsCount}+
              </div>
              <div className="text-[11px] sm:text-xs text-[#A0A6B0] uppercase font-medium mt-0.5">
                Championships
              </div>
            </div>
            <div>
              <div className="font-mono text-xl sm:text-3xl font-black text-emerald-400">
                2185
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
