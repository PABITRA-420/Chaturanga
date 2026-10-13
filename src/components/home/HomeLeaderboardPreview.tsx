'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Trophy, Medal, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { LEADERBOARD_PLAYERS } from '@/data/leaderboardData';

export default function HomeLeaderboardPreview() {
  const topThree = LEADERBOARD_PLAYERS.slice(0, 3);

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#141820] to-[#0D1016] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>COLLEGIATE RATINGS STANDINGS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Club Elo Leaderboard <span className="text-[#D4AF7C]">Top Board</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A6B0] mt-1 max-w-xl font-['Poppins',sans-serif]">
              Live ratings calibrated after official JGEC Swiss rounds. Play in upcoming events to earn your collegiate ranking.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition inline-flex items-center gap-2 self-start md:self-end shadow-md shadow-[#D4AF7C]/20"
          >
            <span>View Full 48+ Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Silver #2 */}
          <div className="p-6 rounded-2xl bg-black/40 border border-slate-400/20 hover:border-slate-300/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-300/10 border border-slate-300/30">
                  Rank #2 • Silver
                </span>
                <span className="text-lg">🥈</span>
              </div>
              <h3 className="font-bold text-lg text-[#F5F5F5]">{topThree[1].name}</h3>
              <p className="text-xs text-[#A0A6B0]">{topThree[1].department} • {topThree[1].year}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#A0A6B0]">Rapid Elo</span>
              <span className="font-mono text-xl font-bold text-slate-200">{topThree[1].rating.rapid}</span>
            </div>
          </div>

          {/* Gold #1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1C1710] to-[#12161D] border-2 border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/15 flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#D4AF7C] text-[#0B0F14] font-black text-[10px] tracking-wider uppercase">
              REIGNING CHAMPION
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#D4AF7C] px-2.5 py-0.5 rounded-full bg-[#D4AF7C]/20 border border-[#D4AF7C]/40">
                  Rank #1 • Gold Crown
                </span>
                <span className="text-xl">👑</span>
              </div>
              <h3 className="font-black text-xl text-[#F5F5F5]">{topThree[0].name}</h3>
              <p className="text-xs text-[#A0A6B0]">{topThree[0].department} • {topThree[0].year}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#D4AF7C]/20 flex items-center justify-between">
              <span className="text-xs text-[#A0A6B0]">Peak Elo</span>
              <span className="font-mono text-2xl font-black text-[#D4AF7C]">{topThree[0].rating.rapid}</span>
            </div>
          </div>

          {/* Bronze #3 */}
          <div className="p-6 rounded-2xl bg-black/40 border border-amber-700/30 hover:border-amber-600/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-500 px-2.5 py-0.5 rounded-full bg-amber-700/20 border border-amber-700/40">
                  Rank #3 • Bronze
                </span>
                <span className="text-lg">🥉</span>
              </div>
              <h3 className="font-bold text-lg text-[#F5F5F5]">{topThree[2].name}</h3>
              <p className="text-xs text-[#A0A6B0]">{topThree[2].department} • {topThree[2].year}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#A0A6B0]">Rapid Elo</span>
              <span className="font-mono text-xl font-bold text-amber-400">{topThree[2].rating.rapid}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
