'use client';

import React from 'react';
import Link from 'next/link';
import UpcomingEventCard from '@/components/UpcomingEventCard';
import PastEventCard from '@/components/PastEventCard';
import TournamentCalendar from '@/components/TournamentCalendar';
import { Calendar, Trophy, ArrowRight } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';

interface HomeTournamentsProps {
  upcomingEvents: any[];
  pastEvents: any[];
  loading?: boolean;
}

export default function HomeTournaments({ upcomingEvents, pastEvents, loading = false }: HomeTournamentsProps) {
  const featured = upcomingEvents.find(e => e.isFeatured) || upcomingEvents[0];
  const otherUpcoming = upcomingEvents.filter(e => e.id !== featured?.id).slice(0, 2);
  const recentPast = pastEvents.slice(0, 2);

  return (
    <div className="space-y-16 py-8">
      
      {/* 1. UPCOMING TOURNAMENTS SECTION */}
      <section id="tournaments" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>04 / COLLEGIATE CALENDAR 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-fg tracking-tight">
              Upcoming Championships <span className="text-accent">&amp;</span> Arenas
            </h2>
          </div>

          <Link
            href="/upcoming"
            className="text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover inline-flex items-center gap-1.5 self-start sm:self-end"
          >
            <span>View All Scheduled Events</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Featured Card, Skeletons or Empty State */}
        {loading ? (
          <div className="space-y-6" data-testid="home-tournaments-skeleton">
            <SkeletonCard isFeatured={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-md bg-surface border border-border text-center space-y-4">
            <div className="w-12 h-12 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
              <Calendar className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-heading text-fg">
                No tournaments currently scheduled
              </h3>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body">
                The boards are quiet for a moment. Our arbiters are calibrating the next Swiss championship schedule. Follow club notices above for upcoming round drops.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/#announcements"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors btn-tactile"
              >
                <span>View Club Notices</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {featured && (
              <div className="space-y-3">
                <UpcomingEventCard event={featured} />
              </div>
            )}

            {otherUpcoming.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {otherUpcoming.map(evt => (
                  <UpcomingEventCard key={evt.id} event={evt} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 2. CALENDAR SECTION */}
      <section id="calendar" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em] block">
              05 / INTERACTIVE GRID
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-fg tracking-tight">
              Season Schedule &amp; Timetable
            </h2>
          </div>
          <p className="text-xs text-fg-muted max-w-sm font-body">
            Select calendar dates to inspect event venue, round schedules, and time controls.
          </p>
        </div>

        <TournamentCalendar />
      </section>

      {/* 3. PAST ARCHIVES SECTION */}
      <section id="past-events" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>06 / HALL OF FAME ARCHIVES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-fg tracking-tight">
              Past Championship Results
            </h2>
          </div>

          <Link
            href="/past-events"
            className="text-xs font-mono font-bold uppercase tracking-wider text-accent hover:text-accent-hover inline-flex items-center gap-1.5 self-start sm:self-end"
          >
            <span>Browse Full Archive &amp; Standings</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="home-past-skeleton">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recentPast.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-md bg-surface border border-border text-center space-y-3">
            <Trophy className="w-8 h-8 text-accent mx-auto opacity-60" aria-hidden="true" />
            <h3 className="font-bold font-heading text-base text-fg">No archived championships yet</h3>
            <p className="text-xs text-fg-muted max-w-md mx-auto leading-relaxed font-body">
              Concluded tournaments, Swiss standings, and podium winners will be certified and permanently archived here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPast.map(pe => (
              <PastEventCard key={pe.id} event={pe} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
