'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Trophy, Clock, Users, ArrowUpRight } from 'lucide-react';

export default function TickerMarquee() {
  const tickerItems = [
    { label: 'NEXT TOURNAMENT', text: 'Chaturanga Spring Blitz Open 2026', link: '/register', badge: 'OPEN' },
    { label: 'ACTIVE RANKING', text: 'Aritra Sen holds #1 Elo at 2185', link: '/leaderboard', badge: 'ELO' },
    { label: 'WEEKLY PRACTICE', text: 'Clock Sparring Wednesdays & Fridays in Room 204', link: '/upcoming', badge: 'SAC 204' },
    { label: 'STATE TRIALS', text: 'Inter-University Selection Rounds on May 10', link: '/#announcements', badge: 'TRIALS' },
    { label: 'HALL OF FAME', text: 'Annual Championship 2025 Crosstable published', link: '/past-events', badge: 'RESULTS' },
  ];

  return (
    <div className="w-full bg-[#10141C] border-y border-white/10 py-3 overflow-hidden select-none">
      <div className="animate-marquee items-center gap-8">
        
        {/* Set 1 */}
        {tickerItems.map((item, idx) => (
          <div key={`set1-${idx}`} className="inline-flex items-center gap-3 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF7C]/15 text-[#D4AF7C] border border-[#D4AF7C]/30 font-mono">
              {item.badge}
            </span>
            <span className="text-xs text-[#A0A6B0] uppercase font-semibold">
              {item.label}:
            </span>
            <Link
              href={item.link}
              className="text-xs font-medium text-[#F5F5F5] hover:text-[#D4AF7C] transition inline-flex items-center gap-1 group"
            >
              <span>{item.text}</span>
              <ArrowUpRight className="w-3 h-3 text-[#D4AF7C] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-white/20 ml-5">•</span>
          </div>
        ))}

        {/* Set 2 for seamless infinite looping */}
        {tickerItems.map((item, idx) => (
          <div key={`set2-${idx}`} className="inline-flex items-center gap-3 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF7C]/15 text-[#D4AF7C] border border-[#D4AF7C]/30 font-mono">
              {item.badge}
            </span>
            <span className="text-xs text-[#A0A6B0] uppercase font-semibold">
              {item.label}:
            </span>
            <Link
              href={item.link}
              className="text-xs font-medium text-[#F5F5F5] hover:text-[#D4AF7C] transition inline-flex items-center gap-1 group"
            >
              <span>{item.text}</span>
              <ArrowUpRight className="w-3 h-3 text-[#D4AF7C] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-white/20 ml-5">•</span>
          </div>
        ))}

      </div>
    </div>
  );
}
