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
  Sparkles, 
  ChevronRight,
  BookOpen,
  Users
} from 'lucide-react';

export default function BentoAbout() {
  return (
    <section id="about" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="max-w-2xl mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C]">
          <Crown className="w-3.5 h-3.5" />
          <span>INSTITUTIONAL HERITAGE</span>
        </div>
        <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight">
          Engineered for <span className="text-[#D4AF7C]">Intellectual Mastery</span>
        </h2>
        <p className="text-sm sm:text-base text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed">
          More than an extracurricular club — CHATURANGA is an institution of tactical discipline, collegiate camaraderie, and FIDE-standard sportsmanship.
        </p>
      </div>

      {/* Differentiated Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* CARD 1: HERITAGE & ORIGINS (Spans full width on tablet, 8 cols on desktop) */}
        <div className="md:col-span-2 lg:col-span-8 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#161B22] via-[#12161D] to-[#0D1016] border border-white/10 hover:border-[#D4AF7C]/40 transition relative overflow-hidden group shadow-2xl flex flex-col justify-between">
          <div className="absolute right-4 -bottom-6 text-9xl font-serif text-[#D4AF7C]/5 pointer-events-none select-none group-hover:text-[#D4AF7C]/10 transition-colors">
            ♔
          </div>
          
          <div className="space-y-4 relative z-10 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
                <Crown className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#D4AF7C]">
                SINCE 2012 • 14 YEARS OF EXCELLENCE
              </span>
            </div>

            <h3 className="font-['Montserrat',sans-serif] font-bold text-2xl sm:text-3xl text-[#F5F5F5]">
              The Bastion of Mind Sports in North Bengal
            </h3>

            <p className="text-xs sm:text-sm text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed">
              Founded by passionate engineering scholars at Jalpaiguri Government Engineering College, Chaturanga has grown from informal hostel corridor games into a premier state-recognized chess organization hosting certified FIDE arbiters and university champions.
            </p>

            {/* Historical Milestones Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-base font-black font-mono text-[#D4AF7C]">2012</div>
                <div className="text-[11px] text-[#A0A6B0] mt-0.5">Club Founded</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-base font-black font-mono text-[#F5F5F5]">12+</div>
                <div className="text-[11px] text-[#A0A6B0] mt-0.5">Annual Cups</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-base font-black font-mono text-emerald-400">48+</div>
                <div className="text-[11px] text-[#A0A6B0] mt-0.5">Ranked Players</div>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <Link
              href="/team"
              className="text-xs font-bold text-[#D4AF7C] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Meet the founding patron &amp; executive council</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2: CLUB TIMINGS & SAC ROOM 204 (Spans 1 col on tablet, 4 on desktop) */}
        <div className="md:col-span-1 lg:col-span-4 p-8 rounded-3xl bg-[#12161D] border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between shadow-xl group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Open SAC 204</span>
              </span>
            </div>

            <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
              Club Timings &amp; Sparring
            </h3>

            <p className="text-xs text-[#A0A6B0] leading-relaxed">
              Casual practice, engine analysis, and blitz games operate throughout the week in Student Activity Centre Room 204.
            </p>

            <div className="space-y-2.5 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A0A6B0]">Wed &amp; Fri:</span>
                <span className="font-bold text-[#F5F5F5] font-mono">04:30 PM – 06:30 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0A6B0]">Saturday Arena:</span>
                <span className="font-bold text-[#D4AF7C] font-mono">02:00 PM – 06:00 PM</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[#A0A6B0]">Equipment:</span>
                <span className="text-white/80">DGT 2010 Clocks + Wooden Staunton</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2 text-xs text-[#A0A6B0]">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF7C]" />
            <span>SAC Building, 2nd Floor, Room 204</span>
          </div>
        </div>

        {/* CARD 3: FIDE SWISS REGULATIONS (Spans 1 col on tablet, 4 on desktop) */}
        <div className="md:col-span-1 lg:col-span-4 p-8 rounded-3xl bg-[#12161D] border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </span>

            <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
              FIDE Swiss Pairings
            </h3>

            <p className="text-xs text-[#A0A6B0] leading-relaxed">
              Every official tournament runs on JaVaFo/Swiss-Manager pairing engines ensuring transparent pairing without bias. Buchholz and Sonneborn-Berger tiebreaks applied.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-[#A0A6B0] space-y-1">
              <div className="font-bold text-[#F5F5F5]">Standard Time Controls:</div>
              <div>• Rapid: 15 min + 10 sec increment</div>
              <div>• Blitz: 3 min + 2 sec increment</div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/upcoming" className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>View tournament rules &rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 4: MASTERCLASSES & STOCKFISH ANALYSIS (Spans 1 col on tablet, 4 on desktop) */}
        <div className="md:col-span-1 lg:col-span-4 p-8 rounded-3xl bg-[#12161D] border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </span>

            <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
              Masterclasses &amp; Tactics
            </h3>

            <p className="text-xs text-[#A0A6B0] leading-relaxed">
              Weekly post-tournament debriefs featuring Stockfish 17 deep analysis, Kasparov/Carlsen study games, and endgame pattern clinics by rated seniors.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-[#A0A6B0] space-y-1">
              <div className="font-bold text-[#F5F5F5]">Key Curriculum:</div>
              <div>• Rook Endgame Lucena &amp; Philidor</div>
              <div>• Sicilian Najdorf &amp; Caro-Kann lines</div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/leaderboard" className="text-xs font-bold text-purple-400 hover:underline inline-flex items-center gap-1">
              <span>Check player Elo rankings &rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 5: TROPHY PURSE & HONORS (Spans 1 col on tablet, 4 on desktop) */}
        <div className="md:col-span-1 lg:col-span-4 p-8 rounded-3xl bg-[#12161D] border border-white/10 hover:border-[#D4AF7C]/40 transition flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <span className="w-10 h-10 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
              <Trophy className="w-5 h-5" />
            </span>

            <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
              Collegiate Championships
            </h3>

            <p className="text-xs text-[#A0A6B0] leading-relaxed">
              Over ₹1,50,000+ awarded in tournament cash scholarships, rolling shields, and commemorative medals across 12 official editions.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-[#A0A6B0] space-y-1">
              <div className="font-bold text-[#F5F5F5]">Annual Honors:</div>
              <div>• JGEC Rolling Gold Cup</div>
              <div>• Best Department Trophy</div>
              <div>• Best Emerging Junior Medal</div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/past-events" className="text-xs font-bold text-[#D4AF7C] hover:underline inline-flex items-center gap-1">
              <span>Explore past champions &rarr;</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
