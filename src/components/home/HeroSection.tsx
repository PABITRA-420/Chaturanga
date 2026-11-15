'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
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
  onRegisterClick: _onRegisterClick,
}: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative w-full border-b border-border bg-bg chess-bg-pattern"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Swiss Editorial Typography & Metrics (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Architectural Status Strip */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xs bg-surface border border-border max-w-full overflow-hidden">
              {featuredEvent && featuredEvent.title && !featuredEvent.isNeutral ? (
                <>
                  <span className="h-2 w-2 rounded-xs bg-success shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent truncate max-w-[200px] sm:max-w-none">
                    Next Up: {featuredEvent.title}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-xs bg-accent shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-fg-muted truncate max-w-[200px] sm:max-w-none">
                    {featuredEvent?.badgeText || 'Official Collegiate Chess Club'}
                  </span>
                </>
              )}
              <span className="text-fg-muted text-[11px] font-mono shrink-0 border-l border-border pl-2.5">
                FIDE Rules
              </span>
            </div>

            {/* Bold Geometric Headline */}
            <div className="space-y-4">
              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-fg tracking-tighter leading-[1.02] uppercase">
                Strategy. <br />
                <span className="text-accent">Mastery.</span> <br />
                Legacy.
              </h1>
              <p className="font-body text-sm sm:text-base text-fg-muted max-w-xl leading-relaxed">
                The official competitive chess club of Jalpaiguri Government Engineering College. Organizing certified Swiss championships, blitz arenas, and cultivating collegiate grandmasters since 2012.
              </p>
            </div>

            {/* Primary & Secondary Action Hierarchy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <ShimmerButton href="/register">
                <span className="flex items-center gap-2">
                  Register as Player
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </ShimmerButton>

              <Link
                href="/upcoming"
                className="px-6 py-3.5 rounded-xs font-ui font-semibold text-xs uppercase tracking-widest text-fg bg-surface hover:bg-surface-elevated border border-border hover:border-border-strong flex items-center justify-center gap-2 group transition-colors btn-tactile"
              >
                <span>Explore Tournaments</span>
                <ChevronRight className="w-4 h-4 text-fg-muted group-hover:text-fg group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
              </Link>
            </div>

            {/* Swiss Modular Metric Hairline Bar */}
            <div className="pt-2">
              <div className="grid grid-cols-3 border border-border rounded-sm bg-surface divide-x divide-border max-w-lg">
                <div className="p-3.5 sm:p-4">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-accent tabular-nums leading-none">
                    {participantsCount > 0 ? `${participantsCount}+` : participantsCount}
                  </div>
                  <div className="text-[10px] sm:text-xs text-fg-muted font-mono uppercase tracking-wider mt-1.5">
                    Competitors
                  </div>
                </div>

                <div className="p-3.5 sm:p-4">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-fg tabular-nums leading-none">
                    {eventsCount > 0 ? `${eventsCount}+` : eventsCount}
                  </div>
                  <div className="text-[10px] sm:text-xs text-fg-muted font-mono uppercase tracking-wider mt-1.5">
                    Championships
                  </div>
                </div>

                <div className="p-3.5 sm:p-4">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-success tabular-nums leading-none">
                    {peakElo && peakElo > 0 ? peakElo : '—'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-fg-muted font-mono uppercase tracking-wider mt-1.5">
                    Peak Elo
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Framed Architectural Visual (5 cols) */}
          <div className="lg:col-span-5">
            <figure className="border border-border bg-surface rounded-sm overflow-hidden">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/4.2] bg-[#111114] overflow-hidden">
                <Image
                  src="/hero.webp"
                  alt="Chaturanga JGEC Chess King on tournament board"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center contrast-[1.08]"
                />
              </div>
              <figcaption className="px-4 py-2.5 border-t border-border bg-surface-elevated flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-fg-muted">
                <span>FIG 01 / TOURNAMENT BOARD</span>
                <span className="text-accent font-bold">SAC ROOM 204 • EST. 2012</span>
              </figcaption>
            </figure>
          </div>

        </div>
      </div>
    </section>
  );
}
