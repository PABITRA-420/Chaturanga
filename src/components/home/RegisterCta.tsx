'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Sparkles, ShieldCheck, Ticket } from 'lucide-react';

export default function RegisterCta() {
  return (
    <section id="register" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#181D26] via-[#12161D] to-[#1C1710] border-2 border-[#D4AF7C]/50 p-8 sm:p-14 shadow-2xl">
        
        {/* Background glow & watermark */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF7C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-0 text-9xl font-serif text-[#D4AF7C]/5 pointer-events-none select-none">
          ♛
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLAIM YOUR BOARD RESERVATION</span>
          </div>

          <h2 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight leading-tight">
            Ready to Make Your <span className="text-[#D4AF7C]">First Move?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed">
            Whether you are a seasoned FIDE tournament competitor or looking to learn competitive openings, CHATURANGA welcomes every student of Jalpaiguri Government Engineering College. Entry is 100% free for JGEC students.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-lg shadow-[#D4AF7C]/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Register for Tournament</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/my-ticket"
              className="px-6 py-4 rounded-full font-semibold text-xs uppercase tracking-widest text-[#F5F5F5] hover:text-[#D4AF7C] bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
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

      </div>
    </section>
  );
}
