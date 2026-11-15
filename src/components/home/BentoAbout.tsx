'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  Clock,
  MapPin,
  ShieldCheck,
  BrainCircuit,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function BentoAbout() {
  return (
    <section id="about" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      
      {/* Header */}
      <div className="max-w-2xl mb-10 space-y-2.5 border-l-2 border-accent pl-4">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
          <Crown className="w-3.5 h-3.5" aria-hidden="true" />
          <span>02 / INSTITUTIONAL HERITAGE</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight">
          Engineered for <span className="text-accent">Intellectual Mastery</span>
        </h2>
        <p className="text-sm sm:text-base text-fg-muted font-body leading-relaxed">
          More than an extracurricular club — CHATURANGA is an institution of tactical discipline, collegiate camaraderie, and FIDE-standard sportsmanship.
        </p>
      </div>

      {/* Swiss 12-Column Architectural Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: HERITAGE & ORIGINS */}
        <div className="md:col-span-2 lg:col-span-8">
          <SpotlightCard className="p-7 sm:p-9 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between group">
            <div className="space-y-4 relative z-10 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent">
                  <Crown className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-accent">
                  SINCE 2012 • 14 YEARS OF EXCELLENCE
                </span>
              </div>

              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-fg">
                The Bastion of Mind Sports in North Bengal
              </h3>

              <p className="text-xs sm:text-sm text-fg-muted font-body leading-relaxed">
                Founded by passionate engineering scholars at Jalpaiguri Government Engineering College, Chaturanga has grown from informal hostel corridor games into a premier state-recognized chess organization hosting certified FIDE arbiters and university champions.
              </p>

              {/* Historical Milestones Modular Strip */}
              <div className="grid grid-cols-3 border border-border rounded-sm bg-surface-elevated divide-x divide-border mt-4">
                <div className="p-3.5">
                  <div className="text-base sm:text-lg font-bold font-mono text-accent tabular-nums">2012</div>
                  <div className="text-[11px] text-fg-muted mt-0.5 font-mono uppercase">Founded</div>
                </div>
                <div className="p-3.5">
                  <div className="text-base sm:text-lg font-bold font-mono text-fg tabular-nums">12+</div>
                  <div className="text-[11px] text-fg-muted mt-0.5 font-mono uppercase">Annual Cups</div>
                </div>
                <div className="p-3.5">
                  <div className="text-base sm:text-lg font-bold font-mono text-success tabular-nums">48+</div>
                  <div className="text-[11px] text-fg-muted mt-0.5 font-mono uppercase">Rated Players</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border relative z-10">
              <Link
                href="/team"
                className="text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover inline-flex items-center gap-1.5 group/link"
              >
                <span>Meet the founding patron &amp; executive council</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* CARD 2: CLUB TIMINGS & SAC ROOM 204 */}
        <div className="md:col-span-1 lg:col-span-4">
          <SpotlightCard className="p-7 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-success">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-success/10 text-success border border-success/30 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  <span>Open SAC 204</span>
                </span>
              </div>

              <h3 className="font-heading font-bold text-xl text-fg">
                Club Timings &amp; Sparring
              </h3>

              <p className="text-xs text-fg-muted leading-relaxed font-body">
                Casual practice, engine analysis, and blitz games operate throughout the week in Student Activity Centre Room 204.
              </p>

              <div className="space-y-2.5 p-3.5 rounded-sm bg-surface-elevated border border-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Wed &amp; Fri:</span>
                  <span className="font-bold text-fg font-mono">04:30 – 06:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Saturday Arena:</span>
                  <span className="font-bold text-accent font-mono">02:00 – 06:00 PM</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-fg-muted">Equipment:</span>
                  <span className="text-fg font-medium">DGT 2010 + Staunton</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center gap-2 text-xs text-fg-muted font-mono">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>SAC Building, 2nd Floor, Room 204</span>
            </div>
          </SpotlightCard>
        </div>

        {/* CARD 3: FIDE SWISS REGULATIONS */}
        <div className="md:col-span-1 lg:col-span-4">
          <SpotlightCard className="p-7 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="w-9 h-9 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-info">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </span>

              <h3 className="font-heading font-bold text-xl text-fg">
                FIDE Swiss Pairings
              </h3>

              <p className="text-xs text-fg-muted leading-relaxed font-body">
                Every official tournament runs on JaVaFo/Swiss-Manager pairing engines ensuring transparent pairing without bias. Buchholz and Sonneborn-Berger tiebreaks applied.
              </p>

              <div className="p-3.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg-muted space-y-1 font-mono">
                <div className="font-bold text-fg uppercase text-[10px] tracking-wider mb-1">Standard Controls:</div>
                <div>• Rapid: 15 min + 10s increment</div>
                <div>• Blitz: 3 min + 2s increment</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/upcoming" className="text-xs font-mono font-bold uppercase tracking-wider text-info hover:underline inline-flex items-center gap-1.5 group/link">
                <span>View tournament rules</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* CARD 4: MASTERCLASSES & STOCKFISH ANALYSIS */}
        <div className="md:col-span-1 lg:col-span-4">
          <SpotlightCard className="p-7 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="w-9 h-9 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <BrainCircuit className="w-4 h-4" aria-hidden="true" />
              </span>

              <h3 className="font-heading font-bold text-xl text-fg">
                Masterclasses &amp; Tactics
              </h3>

              <p className="text-xs text-fg-muted leading-relaxed font-body">
                Weekly post-tournament debriefs featuring Stockfish 17 deep analysis, classical study games, and endgame pattern clinics by rated seniors.
              </p>

              <div className="p-3.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg-muted space-y-1 font-mono">
                <div className="font-bold text-fg uppercase text-[10px] tracking-wider mb-1">Key Curriculum:</div>
                <div>• Rook Endgame Lucena &amp; Philidor</div>
                <div>• Sicilian Najdorf &amp; Caro-Kann</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/leaderboard" className="text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover inline-flex items-center gap-1.5 group/link">
                <span>Check player Elo rankings</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* CARD 5: TROPHY PURSE & HONORS */}
        <div className="md:col-span-1 lg:col-span-4">
          <SpotlightCard className="p-7 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="w-9 h-9 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <Trophy className="w-4 h-4" aria-hidden="true" />
              </span>

              <h3 className="font-heading font-bold text-xl text-fg">
                Collegiate Championships
              </h3>

              <p className="text-xs text-fg-muted leading-relaxed font-body">
                Over ₹1,50,000+ awarded in tournament cash scholarships, rolling shields, and commemorative medals across 12 official editions.
              </p>

              <div className="p-3.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg-muted space-y-1 font-mono">
                <div className="font-bold text-fg uppercase text-[10px] tracking-wider mb-1">Annual Honors:</div>
                <div>• JGEC Rolling Gold Cup</div>
                <div>• Best Department Trophy</div>
                <div>• Best Emerging Junior Medal</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <Link href="/past-events" className="text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover inline-flex items-center gap-1.5 group/link">
                <span>Explore past champions</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

      </div>
    </section>
  );
}
