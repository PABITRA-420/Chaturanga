'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpcomingEventCard from '@/components/UpcomingEventCard';
import TournamentCalendar from '@/components/TournamentCalendar';
import { Calendar, HelpCircle, ShieldCheck, Clock, Award, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] relative overflow-x-hidden font-['Inter',sans-serif]">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          {/* Header Section */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              <span>COLLEGIATE & FIDE SCHEDULE 2026-27</span>
            </div>
            <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight">
              Upcoming Tournaments <span className="text-[#D4AF7C]">&</span> Arenas
            </h1>
            <p className="text-sm sm:text-base text-[#A0A6B0] max-w-2xl font-['Poppins',sans-serif] leading-relaxed">
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
            <div className="p-10 sm:p-14 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center mx-auto text-[#D4AF7C]">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
                  No Upcoming Championships Scheduled
                </h3>
                <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                  There are currently no active tournament registrations open. New tournament circuits are announced regularly on our club notice board.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/#announcements"
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-md transition"
                >
                  Check Notice Board
                </Link>
                <Link
                  href="/past-events"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  Browse Past Archives
                </Link>
              </div>
            </div>
          )}

          {/* Section 1: Next Immediate Flagship Tournament */}
          {!loading && nearestEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF7C] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Next Immediate Flagship Event</span>
              </div>
              <UpcomingEventCard event={nearestEvent} />
            </div>
          )}

          {/* Section 2: Subsequent Calendar Tournaments */}
          {subsequentEvents.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A0A6B0] uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#D4AF7C]" />
                  <span>Subsequent Scheduled Circuits ({subsequentEvents.length})</span>
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider block mb-1">
                  Full Season Timeline
                </span>
                <h2 className="font-['Montserrat',sans-serif] font-bold text-2xl sm:text-3xl text-[#F5F5F5]">
                  Interactive Tournament Calendar
                </h2>
              </div>
              <p className="text-xs text-[#A0A6B0] max-w-md font-['Poppins',sans-serif]">
                Click any highlighted date square to inspect rounds, venue hall, time controls, and eligibility guidelines.
              </p>
            </div>

            <TournamentCalendar />
          </div>

          {/* Section 4: Expandable General Player FAQ & Regulations */}
          <FaqAccordion />

        </div>
      </main>

      <Footer />
    </div>
  );
}
