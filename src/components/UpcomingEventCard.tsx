"use client";

import React from 'react';
import Link from 'next/link';
import { UpcomingEvent } from '@/data/tournamentData';
import CountdownTimer from './CountdownTimer';
import { Calendar, Clock, MapPin, Trophy, Users, ArrowRight, Sparkles, Radio } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import BorderBeam from '@/components/ui/BorderBeam';
import ShimmerButton from '@/components/ui/ShimmerButton';
import AddToCalendarButton from '@/components/ui/AddToCalendarButton';

interface UpcomingEventCardProps {
  event: UpcomingEvent;
}

export default function UpcomingEventCard({ event }: UpcomingEventCardProps) {
  if (event.isFeatured) {
    // 1. NEAREST/FLAGSHIP EVENT: 21st.dev ULTRA-LUXURY SPOTLIGHT + BORDER BEAM
    return (
      <SpotlightCard
        className="rounded-3xl bg-gradient-to-br from-[#1C1710] via-[#12161D] to-[#0A0D12] p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-[0_10px_50px_rgba(212,175,124,0.18)] hover-lift-gold"
        spotlightColor="rgba(212, 175, 124, 0.16)"
        size={500}
        interactiveTilt={false}
      >
        {/* 21st.dev Single Outer Border Beam - shimmer moves through the exact outer border */}
        <BorderBeam duration={9} colorFrom="#D4AF7C" colorTo="#F3E2B8" baseColor="rgba(212, 175, 124, 0.45)" borderWidth={2} />

        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF7C]/12 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#D4AF7C]/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        {/* Watermark Chess Trophy in background */}
        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-[0.035] group-hover:opacity-[0.07] transition-opacity duration-500 text-white select-none">
          <Trophy className="w-80 h-80" />
        </div>

        <div className="relative z-10 space-y-6 lg:space-y-8">
          
          {/* Top Banner: Status + Nearest Flag */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/30 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Championship • Live Registration</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              <span>{event.slots}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-[#F5F5F5] tracking-tight leading-tight group-hover:text-[#F3E2B8] transition-colors">
              {event.title}
            </h3>
            <p className="text-sm sm:text-base text-[#A0A6B0] max-w-3xl leading-relaxed font-['Poppins',sans-serif]">
              {event.description}
            </p>
          </div>

          {/* REAL-TIME LIVE COUNTDOWN CLOCK */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-[#D4AF7C]/30 backdrop-blur-md space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF7C]">
                <Clock className="w-3.5 h-3.5" />
                <span>OFFICIAL MATCH CLOCK COUNTDOWN</span>
              </div>
              <span className="text-[11px] text-[#A0A6B0] font-mono hidden sm:inline">
                FIDE Sanctioned
              </span>
            </div>
            <CountdownTimer targetDate={event.targetDate} />
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 text-xs font-['Poppins',sans-serif]">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 hover:border-[#D4AF7C]/30 transition-all backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#D4AF7C] font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Match Date</span>
              </div>
              <div className="text-[#F5F5F5] font-medium text-sm">{event.date}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 hover:border-[#D4AF7C]/30 transition-all backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#D4AF7C] font-semibold">
                <Clock className="w-4 h-4" />
                <span>Reporting Time</span>
              </div>
              <div className="text-[#F5F5F5] font-medium text-sm">{event.time}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 hover:border-[#D4AF7C]/30 transition-all backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#D4AF7C] font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Playing Hall</span>
              </div>
              <div className="text-[#F5F5F5] font-medium text-sm">{event.venue}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 space-y-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#D4AF7C] font-semibold">
                <Trophy className="w-4 h-4" />
                <span>Guaranteed Prize</span>
              </div>
              <div className="text-[#F3E2B8] font-bold font-mono text-base tracking-tight">{event.prizePool}</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-[#A0A6B0]">
                Format: <span className="text-[#F5F5F5] font-semibold bg-white/5 px-2.5 py-1 rounded-md border border-white/10 ml-1.5">{event.format}</span>
              </div>
              <AddToCalendarButton event={event} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/tournaments/${event.id}/live`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-['Inter',sans-serif] text-xs uppercase tracking-wider font-bold text-white bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 hover:border-red-500/70 transition-all duration-300 shadow-lg shadow-red-950/20 active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Live Broadcast</span>
              </Link>

              <ShimmerButton
                href={`/register?event=${event.id}`}
                className="px-8 py-3.5"
                shimmerColor="#FFFFFF"
                background="linear-gradient(135deg, #E6C98A 0%, #D4AF7C 50%, #C39958 100%)"
              >
                <span className="text-[#0B0F14] font-extrabold flex items-center gap-2">
                  Register &amp; Generate Pass
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0B0F14]" />
                </span>
              </ShimmerButton>
            </div>
          </div>

        </div>
      </SpotlightCard>
    );
  }

  // 2. SUBSEQUENT EVENTS: 21st.dev SPOTLIGHT WITH TITANIUM ACCENTS
  return (
    <SpotlightCard
      className="p-6 sm:p-7 h-full rounded-2xl bg-gradient-to-b from-[#11141A] to-[#0A0D12] border border-white/10 flex flex-col justify-between overflow-hidden group hover-lift-gold shadow-xl"
      spotlightColor="rgba(212, 175, 124, 0.12)"
      size={300}
      interactiveTilt={true}
    >
      <div className="space-y-5 relative z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-neutral-300 bg-white/5 border border-white/15 uppercase tracking-wider group-hover:border-[#D4AF7C]/40 group-hover:text-[#D4AF7C] transition-colors">
            <Trophy className="w-3.5 h-3.5" />
            <span>Circuit Event</span>
          </span>

          <div className="flex items-center gap-2">
            <AddToCalendarButton event={event} size="sm" />
            <span className="text-[11px] text-neutral-400 font-mono bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
              {event.slots}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-['Montserrat',sans-serif] font-bold text-lg sm:text-xl text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-['Poppins',sans-serif] leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Meta Specs Grid */}
        <div className="space-y-2.5 py-1 text-xs text-neutral-300 font-['Poppins',sans-serif]">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D4AF7C] transition-colors shrink-0" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D4AF7C] transition-colors shrink-0" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#D4AF7C] transition-colors shrink-0" />
            <span className="text-neutral-200">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2.5 pt-1 border-t border-white/5">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
            <span>Prize Pool: <strong className="text-neutral-100 font-mono text-sm ml-1">{event.prizePool}</strong></span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-400">
          <span className="text-neutral-200 font-medium">Format: </span> {event.format}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between relative z-10 gap-2">
        <Link
          href={`/tournaments/${event.id}/live`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 hover:bg-[#D4AF7C]/20 transition"
        >
          <Radio className="w-3.5 h-3.5 text-[#D4AF7C]" />
          <span>Live Board</span>
        </Link>
        
        <Link
          href={`/register?event=${event.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#F5F5F5] hover:bg-[#D4AF7C] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md"
        >
          <span>Register Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </SpotlightCard>
  );
}
