'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpcomingEventCard from '@/components/UpcomingEventCard';
import TournamentCalendar from '@/components/TournamentCalendar';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/ui/Skeleton';
import FaqAccordion from '@/components/ui/FaqAccordion';

export default function UpcomingEventsView() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch('/api/tournaments?type=upcoming')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          setEvents(data.tournaments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nearestEvent = events.find((e) => e.isFeatured) || events[0] || null;
  const subsequentEvents = nearestEvent ? events.filter((e) => e.id !== nearestEvent.id) : [];

  return (
    <div className="min-h-screen bg-bg text-fg antialiased selection:bg-accent selection:text-on-accent relative overflow-x-hidden font-ui">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          {/* Header Section */}
          <div className="space-y-3 border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>COLLEGIATE &amp; FIDE SCHEDULE 2026-27</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight">
              Upcoming Tournaments <span className="text-accent">&amp;</span> Arenas
            </h1>
            <p className="text-sm sm:text-base text-fg-muted max-w-2xl font-body leading-relaxed">
              Explore the official competitive calendar of Jalpaiguri Government Engineering College. Register early to secure your board reservation and official pairings index.
            </p>
          </div>

          {/* Zero-CLS Skeleton Loading */}
          {loading && (
            <div className="space-y-8" data-testid="upcoming-events-skeleton">
              <SkeletonCard isFeatured={true} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && events.length === 0 && (
            <div className="p-10 sm:p-14 rounded-md bg-surface border border-border text-center space-y-4">
              <div className="w-14 h-14 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
                <Calendar className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-heading font-bold text-xl text-fg">
                  No Upcoming Championships Scheduled
                </h3>
                <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body">
                  There are currently no active tournament registrations open. New tournament circuits are announced regularly on our club notice board.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/#announcements"
                  className="px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors"
                >
                  Check Notice Board
                </Link>
                <Link
                  href="/past-events"
                  className="px-5 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors"
                >
                  Browse Past Archives
                </Link>
              </div>
            </div>
          )}

          {/* Section 1: Next Immediate Flagship Tournament */}
          {!loading && nearestEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase tracking-wider">
                <span>01 / NEXT FLAGSHIP EVENT</span>
              </div>
              <UpcomingEventCard event={nearestEvent} />
            </div>
          )}

          {/* Section 2: Subsequent Calendar Tournaments */}
          {subsequentEvents.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-fg-muted uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
                  <span>02 / Subsequent Scheduled Circuits ({subsequentEvents.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subsequentEvents.map((evt) => (
                  <UpcomingEventCard key={evt.id} event={evt} />
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Interactive Visual Month Calendar */}
          <div className="space-y-6 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em] block mb-1">
                  03 / FULL SEASON TIMELINE
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-fg">
                  Interactive Tournament Calendar
                </h2>
              </div>
              <p className="text-xs text-fg-muted max-w-md font-body">
                Select any highlighted date square to inspect rounds, venue hall, time controls, and eligibility guidelines.
              </p>
            </div>

            <TournamentCalendar />
          </div>

          {/* Section 4: FAQ */}
          <FaqAccordion />

        </div>
      </main>

      <Footer />
    </div>
  );
}
