'use client';

import React from 'react';
import Link from 'next/link';
import UpcomingEventCard from '@/components/UpcomingEventCard';
import PastEventCard from '@/components/PastEventCard';
import TournamentCalendar from '@/components/TournamentCalendar';
import { Calendar, Trophy, ArrowRight, Sparkles } from 'lucide-react';

interface HomeTournamentsProps {
  upcomingEvents: any[];
  pastEvents: any[];
}

export default function HomeTournaments({ upcomingEvents, pastEvents }: HomeTournamentsProps) {
  const featured = upcomingEvents.find(e => e.isFeatured) || upcomingEvents[0];
  const otherUpcoming = upcomingEvents.filter(e => e.id !== featured?.id).slice(0, 2);
  const recentPast = pastEvents.slice(0, 2);

  return (
    <div className="space-y-20 py-8">
      
      {/* 1. UPCOMING TOURNAMENTS SECTION */}
      <section id="tournaments" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>COLLEGIATE CALENDAR 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Upcoming Championships <span className="text-[#D4AF7C]">&</span> Arenas
            </h2>
          </div>

          <Link
            href="/upcoming"
            className="text-xs font-bold text-[#D4AF7C] hover:underline inline-flex items-center gap-1.5 self-start sm:self-end"
          >
            <span>View All Scheduled Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Featured Card or Empty State */}
        {upcomingEvents.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center mx-auto text-[#D4AF7C]">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]">
                No tournaments currently scheduled
              </h3>
              <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                Check back soon or follow the club announcements below for new tournament announcements and Swiss round schedules.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/#announcements"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-md transition"
              >
                <span>View Club Notices</span>
                <ArrowRight className="w-3.5 h-3.5" />
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

            {/* Other Upcoming */}
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider block mb-1">
              Interactive Grid
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Season Schedule &amp; Timetable
            </h2>
          </div>
          <p className="text-xs text-[#A0A6B0] max-w-sm font-['Poppins',sans-serif]">
            Select calendar dates to inspect event venue, round schedules, and time controls.
          </p>
        </div>

        <TournamentCalendar />
      </section>

      {/* 3. PAST ARCHIVES SECTION */}
      <section id="past-events" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>HALL OF FAME ARCHIVES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Past Championship Results
            </h2>
          </div>

          <Link
            href="/past-events"
            className="text-xs font-bold text-[#D4AF7C] hover:underline inline-flex items-center gap-1.5 self-start sm:self-end"
          >
            <span>Browse Full Archive &amp; Standings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPast.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-3 shadow-xl">
            <Trophy className="w-8 h-8 text-[#D4AF7C]/40 mx-auto" />
            <h3 className="font-bold text-base text-[#F5F5F5]">No archived championships yet</h3>
            <p className="text-xs text-[#A0A6B0] max-w-md mx-auto leading-relaxed">
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
