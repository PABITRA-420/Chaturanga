'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PastEventCard from '@/components/PastEventCard';
import { Trophy, Search, Award, Sparkles, Filter } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function PastEventsView() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');

  React.useEffect(() => {
    fetch('/api/tournaments?type=past')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          setPastEvents(data.tournaments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = pastEvents.filter((event) => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.podium && event.podium.some((p: any) => p.name?.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesFormat = 
      selectedFormat === 'ALL' ||
      (selectedFormat === 'SWISS' && event.format?.toLowerCase().includes('swiss')) ||
      (selectedFormat === 'BLITZ' && event.format?.toLowerCase().includes('blitz')) ||
      (selectedFormat === 'TEAM' && event.format?.toLowerCase().includes('team'));

    return matchesSearch && matchesFormat;
  });

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] relative overflow-x-hidden font-['Inter',sans-serif]">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                <span>CHAMPIONSHIP ARCHIVES & RESULTS</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight">
                Past Tournaments <span className="text-[#D4AF7C]">&</span> Hall of Fame
              </h1>
              <p className="text-sm sm:text-base text-[#A0A6B0] max-w-2xl font-['Poppins',sans-serif] leading-relaxed">
                Relive memorable rounds, final standings, and tournament podiums of past events organized by CHATURANGA.JGEC. Click any tournament to inspect the complete crosstable.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-[#12161D] border border-white/10">
                <div className="text-[11px] text-[#A0A6B0] uppercase font-mono">Archived Events</div>
                <div className="text-xl font-bold font-mono text-[#D4AF7C]">{pastEvents.length} Editions</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#12161D] border border-white/10 shadow-xl">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tournament title, winner, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
                aria-label="Search past tournaments"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'SWISS', 'BLITZ', 'TEAM'].map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedFormat === format
                      ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-bold shadow'
                      : 'bg-[#080B0F] text-[#A0A6B0] hover:text-[#F5F5F5] border border-white/10'
                  }`}
                >
                  {format === 'ALL' ? 'All Formats' : format}
                </button>
              ))}
            </div>
          </div>

          {/* Past Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="past-events-skeleton">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#12161D] border border-white/10 space-y-3">
              <Trophy className="w-10 h-10 text-[#D4AF7C]/40 mx-auto" />
              <h3 className="font-bold text-lg text-[#F5F5F5]">No archived tournaments yet</h3>
              <p className="text-xs text-[#A0A6B0] max-w-sm mx-auto leading-relaxed">
                Past championships, full crosstables, and podium records will be certified and permanently displayed here.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#12161D] border border-white/10 space-y-3">
              <Trophy className="w-8 h-8 text-[#D4AF7C]/40 mx-auto" />
              <h3 className="font-bold text-lg text-[#F5F5F5]">No archived events match your filter</h3>
              <p className="text-xs text-[#A0A6B0] max-w-sm mx-auto">
                Try clearing your search query or selecting "All Formats" to view complete tournament history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
