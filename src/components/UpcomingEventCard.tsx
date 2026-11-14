"use client";

import React from 'react';
import Link from 'next/link';
import { UpcomingEvent } from '@/data/tournamentData';
import CountdownTimer from './CountdownTimer';
import { Calendar, Clock, MapPin, Trophy, Users, ArrowRight, Radio } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ShimmerButton from '@/components/ui/ShimmerButton';
import AddToCalendarButton from '@/components/ui/AddToCalendarButton';

interface UpcomingEventCardProps {
  event: UpcomingEvent;
}

export default function UpcomingEventCard({ event }: UpcomingEventCardProps) {
  if (event.isFeatured) {
    return (
      <SpotlightCard className="rounded-md bg-surface border-2 border-border-strong p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Swiss Hairline Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />

        <div className="relative z-10 space-y-6 lg:space-y-8">
          
          {/* Top Banner: Status + Capacity */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-on-accent bg-accent uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-on-accent" aria-hidden="true" />
              <span>Flagship Championship • Live Registration</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-xs font-mono font-semibold text-fg bg-surface-elevated border border-border">
              <Users className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>{event.slots}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-fg tracking-tight leading-tight">
              {event.title}
            </h3>
            <p className="text-sm sm:text-base text-fg-muted max-w-3xl leading-relaxed font-body">
              {event.description}
            </p>
          </div>

          {/* REAL-TIME LIVE COUNTDOWN CLOCK */}
          <div className="p-5 sm:p-6 rounded-sm bg-surface-elevated border border-border space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>OFFICIAL MATCH CLOCK COUNTDOWN</span>
              </div>
              <span className="text-[11px] text-fg-muted font-mono hidden sm:inline">
                FIDE Sanctioned
              </span>
            </div>
            <CountdownTimer targetDate={event.targetDate} />
          </div>

          {/* Meta Details Swiss Hairline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border rounded-sm bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border text-xs font-body">
            <div className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-accent font-mono text-[11px] font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Match Date</span>
              </div>
              <div className="text-fg font-semibold text-sm">{event.date}</div>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-accent font-mono text-[11px] font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reporting Time</span>
              </div>
              <div className="text-fg font-semibold text-sm">{event.time}</div>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-accent font-mono text-[11px] font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Playing Hall</span>
              </div>
              <div className="text-fg font-semibold text-sm">{event.venue}</div>
            </div>

            <div className="p-4 space-y-1.5 bg-accent/10">
              <div className="flex items-center gap-2 text-accent font-mono text-[11px] font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Guaranteed Prize</span>
              </div>
              <div className="text-accent font-bold font-mono text-base tracking-tight tabular-nums">{event.prizePool}</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-fg-muted font-mono">
                Format: <span className="text-fg font-semibold bg-surface-elevated px-2.5 py-1 rounded-xs border border-border ml-1">{event.format}</span>
              </div>
              <AddToCalendarButton event={event} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/tournaments/${event.id}/live`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xs font-ui text-xs uppercase tracking-wider font-bold text-danger bg-surface-elevated hover:bg-surface-subtle border border-danger/40 hover:border-danger transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-danger shrink-0" aria-hidden="true" />
                <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Live Broadcast</span>
              </Link>

              <ShimmerButton href={`/register?event=${event.id}`}>
                <span className="flex items-center gap-2">
                  Register &amp; Generate Pass
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </ShimmerButton>
            </div>
          </div>

        </div>
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard className="p-6 sm:p-7 h-full rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between overflow-hidden group">
      <div className="space-y-5 relative z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold text-fg-muted bg-surface-elevated border border-border uppercase tracking-wider group-hover:text-accent transition-colors">
            <Trophy className="w-3 h-3" aria-hidden="true" />
            <span>Circuit Event</span>
          </span>

          <div className="flex items-center gap-2">
            <AddToCalendarButton event={event} size="sm" />
            <span className="text-[11px] text-fg-muted font-mono bg-surface-elevated px-2.5 py-1 rounded-xs border border-border">
              {event.slots}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-fg group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-fg-muted font-body leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Meta Specs */}
        <div className="space-y-2 py-1 text-xs text-fg-muted font-body">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span className="text-fg font-medium">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-border">
            <Trophy className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
            <span>Prize Pool: <strong className="text-fg font-mono text-sm ml-1">{event.prizePool}</strong></span>
          </div>
        </div>

        <div className="p-3 rounded-sm bg-surface-elevated border border-border text-xs text-fg-muted font-mono">
          <span className="text-fg font-semibold">Format: </span> {event.format}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-border flex items-center justify-between relative z-10 gap-2">
        <Link
          href={`/tournaments/${event.id}/live`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-xs font-mono font-semibold text-accent bg-surface-elevated border border-border hover:border-border-strong transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span>Live Board</span>
        </Link>
        
        <Link
          href={`/register?event=${event.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-on-primary bg-primary hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span>Register Now</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </SpotlightCard>
  );
}
