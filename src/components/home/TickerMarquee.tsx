'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface TickerItem {
  label: string;
  text: string;
  link: string;
  badge: string;
}

const DEFAULT_CLUB_MOTTOS: TickerItem[] = [
  {
    label: 'CHATURANGA JGEC',
    text: 'Strategy • Mastery • Legacy — The Premier Competitive Chess Club of JGEC',
    link: '/upcoming',
    badge: 'EST. 2012',
  },
  {
    label: 'CLUB MOTTO',
    text: 'Gens Una Sumus — We Are One Family Across 64 Squares',
    link: '/#about',
    badge: 'FIDE',
  },
  {
    label: 'CAMPUS PRACTICE',
    text: 'Weekly Clock Sparring & Swiss Grandmaster Game Analysis in Room 204',
    link: '/upcoming',
    badge: 'COLLEGE',
  },
];

export default function TickerMarquee() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(DEFAULT_CLUB_MOTTOS);

  useEffect(() => {
    let isMounted = true;

    async function loadTickerData() {
      try {
        const [tournRes, leaderRes, annRes] = await Promise.allSettled([
          fetch('/api/tournaments?type=upcoming').then(r => r.json()),
          fetch('/api/leaderboard?sortBy=rapid').then(r => r.json()),
          fetch('/api/announcements').then(r => r.json()),
        ]);

        const dynamicItems: TickerItem[] = [];

        if (tournRes.status === 'fulfilled' && tournRes.value?.success && Array.isArray(tournRes.value.tournaments)) {
          const upcoming = tournRes.value.tournaments.find((t: any) => !t.isPast && t.status !== 'completed');
          if (upcoming) {
            dynamicItems.push({
              label: 'NEXT TOURNAMENT',
              text: `${upcoming.title} (${upcoming.date})`,
              link: `/register?event=${upcoming.id}`,
              badge: (upcoming.status || 'OPEN').toUpperCase().replace('_', ' '),
            });
          }
        }

        if (leaderRes.status === 'fulfilled' && leaderRes.value?.success && Array.isArray(leaderRes.value.players)) {
          const topPlayer = leaderRes.value.players[0];
          if (topPlayer) {
            dynamicItems.push({
              label: 'TOP BOARD',
              text: `${topPlayer.name} leads active ranking with ${topPlayer.rating?.rapid ?? 1200} Rapid Elo`,
              link: '/leaderboard',
              badge: '#1 ELO',
            });
          }
        }

        if (annRes.status === 'fulfilled' && annRes.value?.success && Array.isArray(annRes.value.announcements)) {
          annRes.value.announcements.slice(0, 3).forEach((ann: any) => {
            dynamicItems.push({
              label: ann.category || 'NOTICE',
              text: ann.title,
              link: ann.linkUrl || '/#announcements',
              badge: ann.isUrgent ? 'URGENT' : ann.category || 'CLUB',
            });
          });
        }

        if (isMounted) {
          setTickerItems(dynamicItems.length > 0 ? dynamicItems : DEFAULT_CLUB_MOTTOS);
        }
      } catch (err) {
        console.warn('Ticker data fetch error:', err);
      }
    }

    loadTickerData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-surface border-b border-border py-2.5 overflow-hidden select-none">
      <div className="animate-marquee items-center gap-8">
        
        {/* Set 1 */}
        {tickerItems.map((item, idx) => (
          <div key={`set1-${idx}`} className="inline-flex items-center gap-3 shrink-0">
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-surface-elevated text-accent border border-border font-mono">
              {item.badge}
            </span>
            <span className="text-xs text-fg-muted font-mono uppercase font-semibold">
              {item.label}:
            </span>
            <Link
              href={item.link}
              className="text-xs font-medium text-fg hover:text-accent transition-colors inline-flex items-center gap-1 group"
            >
              <span>{item.text}</span>
              <ArrowUpRight className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </Link>
            <span className="text-border-strong ml-5" aria-hidden="true">/</span>
          </div>
        ))}

        {/* Set 2 for seamless infinite looping */}
        {tickerItems.map((item, idx) => (
          <div key={`set2-${idx}`} aria-hidden="true" className="inline-flex items-center gap-3 shrink-0">
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-surface-elevated text-accent border border-border font-mono">
              {item.badge}
            </span>
            <span className="text-xs text-fg-muted font-mono uppercase font-semibold">
              {item.label}:
            </span>
            <Link
              href={item.link}
              tabIndex={-1}
              className="text-xs font-medium text-fg hover:text-accent transition-colors inline-flex items-center gap-1 group"
            >
              <span>{item.text}</span>
              <ArrowUpRight className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-border-strong ml-5">/</span>
          </div>
        ))}

      </div>
    </div>
  );
}
