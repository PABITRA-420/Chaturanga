'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PastEventCard from '@/components/PastEventCard';
import { Trophy, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-bg text-fg antialiased selection:bg-accent selection:text-on-accent relative overflow-x-hidden font-ui">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
                <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>CHAMPIONSHIP ARCHIVES &amp; RESULTS</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight">
                Past Tournaments <span className="text-accent">&amp;</span> Hall of Fame
              </h1>
              <p className="text-sm sm:text-base text-fg-muted max-w-2xl font-body leading-relaxed">
                Relive memorable rounds, final standings, and tournament podiums organized by CHATURANGA.JGEC. Select any tournament to inspect the complete crosstable.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-sm bg-surface border border-border">
                <div className="text-[10px] text-fg-muted uppercase font-mono">Archived Events</div>
                <div className="text-xl font-bold font-mono text-accent tabular-nums">{pastEvents.length} Editions</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-md bg-surface border border-border">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search tournament title, winner, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                aria-label="Search past tournaments"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'SWISS', 'BLITZ', 'TEAM'].map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3.5 py-2 rounded-xs text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    selectedFormat === format
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-elevated text-fg-muted hover:text-fg border-border hover:border-border-strong'
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
            <div className="p-12 text-center rounded-md bg-surface border border-border space-y-3">
              <Trophy className="w-10 h-10 text-accent mx-auto opacity-60" aria-hidden="true" />
              <h3 className="font-heading font-bold text-lg text-fg">No archived tournaments yet</h3>
              <p className="text-xs text-fg-muted max-w-sm mx-auto leading-relaxed font-body">
                Past championships, full crosstables, and podium records will be certified and permanently displayed here.
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-md bg-surface border border-border space-y-3">
              <Trophy className="w-8 h-8 text-accent mx-auto opacity-60" aria-hidden="true" />
              <h3 className="font-heading font-bold text-lg text-fg">No archived events match your filter</h3>
              <p className="text-xs text-fg-muted max-w-sm mx-auto font-body">
                Try clearing your search query or selecting &quot;All Formats&quot; to view complete tournament history.
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
