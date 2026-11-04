'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Sparkles, ShieldCheck, Ticket } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import BorderBeam from '@/components/ui/BorderBeam';
import ShimmerButton from '@/components/ui/ShimmerButton';

export default function RegisterCta() {
  return (
    <section id="register" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SpotlightCard
        className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#181D26] via-[#12161D] to-[#1C1710] relative overflow-hidden shadow-2xl"
        spotlightColor="rgba(212, 175, 124, 0.16)"
        size={500}
        interactiveTilt={false}
      >
        {/* 21st.dev Single Outer Border Beam - shimmer moves through the exact outer border */}
        <BorderBeam duration={11} colorFrom="#D4AF7C" colorTo="#F3E2B8" baseColor="rgba(212, 175, 124, 0.35)" borderWidth={2} />
        
        {/* Ambient background glow & watermark */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF7C]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-0 text-9xl font-serif text-[#D4AF7C]/5 pointer-events-none select-none group-hover:text-[#D4AF7C]/10 transition-colors duration-500">
          ♛
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C] shadow-[0_0_15px_rgba(212,175,124,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLAIM YOUR BOARD RESERVATION</span>
          </div>

          <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight leading-tight">
            Ready to Make Your <span className="text-[#D4AF7C] drop-shadow-[0_2px_16px_rgba(212,175,124,0.3)]">First Move?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed">
            Whether you are a seasoned FIDE tournament competitor or looking to learn competitive openings, CHATURANGA welcomes every student of Jalpaiguri Government Engineering College. Entry is 100% free for JGEC students.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <ShimmerButton
              href="/register"
              className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#0B0F14]"
              shimmerColor="#FFFFFF"
              background="linear-gradient(135deg, #E6C98A 0%, #D4AF7C 50%, #C39958 100%)"
            >
              <span className="text-[#0B0F14] font-extrabold flex items-center gap-2">
                Register for Tournament
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0B0F14]" />
              </span>
            </ShimmerButton>

            <Link
              href="/my-ticket"
              className="px-7 py-4 rounded-full font-semibold text-xs uppercase tracking-widest text-[#F5F5F5] hover:text-[#D4AF7C] bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-[#D4AF7C]/40 transition-all flex items-center justify-center gap-2 backdrop-blur-sm btn-tactile"
            >
              <Ticket className="w-4 h-4 text-[#D4AF7C]" />
              <span>Check My Ticket Pass</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#A0A6B0]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF7C] shrink-0" />
              <span>Official FIDE Regulations</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D4AF7C] shrink-0" />
              <span>₹25,000+ Prize Purses</span>
            </div>
          </div>
        </div>

      </SpotlightCard>
    </section>
  );
}
