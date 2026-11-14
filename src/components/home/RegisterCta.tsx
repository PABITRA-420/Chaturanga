'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, ShieldCheck, Ticket } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ShimmerButton from '@/components/ui/ShimmerButton';

export default function RegisterCta() {
  return (
    <section id="register" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <SpotlightCard className="p-8 sm:p-12 rounded-md bg-surface border border-border-strong relative overflow-hidden">
        {/* Swiss Left Accent Stripe */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-accent" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
              <span>07 / CLAIM YOUR BOARD RESERVATION</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight leading-[1.06]">
              Ready to Make Your <span className="text-accent">First Move?</span>
            </h2>

            <p className="text-sm sm:text-base text-fg-muted font-body leading-relaxed max-w-2xl">
              Whether you are a seasoned FIDE tournament competitor or looking to learn competitive openings, CHATURANGA welcomes every student of Jalpaiguri Government Engineering College. Entry is 100% free for JGEC students.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-fg-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>Official FIDE Regulations</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>₹25,000+ Prize Purses</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <ShimmerButton href="/register" className="w-full justify-center">
              <span className="flex items-center gap-2">
                Register for Tournament
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </ShimmerButton>

            <Link
              href="/my-ticket"
              className="w-full px-6 py-3.5 rounded-xs font-ui font-semibold text-xs uppercase tracking-widest text-fg bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors flex items-center justify-center gap-2 btn-tactile"
            >
              <Ticket className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Check My Ticket Pass</span>
            </Link>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
