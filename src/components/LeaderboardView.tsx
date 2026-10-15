'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Trophy, 
  Crown, 
  Search, 
  Medal, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Zap, 
  BookOpen, 
  Sparkles
} from 'lucide-react';
import { LeaderboardPlayer } from '@/types/leaderboard';

export default function LeaderboardView() {
  const [ratingMode, setRatingMode] = useState<'rapid' | 'blitz' | 'classical'>('rapid');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'winRate' | 'matches'>('rating');

  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch live players from Supabase API
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/leaderboard?sortBy=${ratingMode}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
      })
      .catch(err => console.warn('Leaderboard live sync error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [ratingMode]);

  // Filter and Sort Players
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return players.filter(p => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.chessUsername && p.chessUsername.toLowerCase().includes(q)) ||
        (p.lichessUsername && p.lichessUsername.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        const aRat = a.rating?.[ratingMode] ?? 0;
        const bRat = b.rating?.[ratingMode] ?? 0;
        return bRat - aRat;
      }
      if (sortBy === 'winRate') {
        return (b.stats?.winRate ?? 0) - (a.stats?.winRate ?? 0);
      }
      return (b.stats?.matchesPlayed ?? 0) - (a.stats?.matchesPlayed ?? 0);
    });
  }, [players, ratingMode, searchQuery, sortBy]);

  const topThree = useMemo(() => {
    return filteredPlayers.slice(0, 3);
  }, [filteredPlayers]);

  const maxRating = players.length > 0 ? Math.max(...players.map(p => p.rating?.[ratingMode] || 0)) : 0;
  const bestDeptPlayer = players.length > 0 
    ? [...players].sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0))[0] 
    : null;

  const getPlayerPlatform = (p: LeaderboardPlayer) => {
    if (p.lichessUsername) {
      return {
        platform: 'Lichess',
        username: p.lichessUsername,
        url: `https://lichess.org/@/${p.lichessUsername}`,
        color: 'text-sky-300 bg-sky-500/10 border-sky-500/30'
      };
    }
    if (p.chessComUsername || p.chessUsername) {
      const handle = p.chessComUsername || p.chessUsername;
      return {
        platform: 'Chess.com',
        username: handle,
        url: `https://www.chess.com/member/${handle}`,
        color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#12161D] to-[#0D1016] border border-white/10 overflow-hidden shadow-2xl">
            
            {/* Background chess watermark */}
            <div className="absolute right-6 -bottom-10 select-none pointer-events-none opacity-5 text-9xl font-serif text-[#D4AF7C]">
              ♔
            </div>
            
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C] mb-4">
                <Crown className="w-3.5 h-3.5" />
                <span>Official JGEC Club Elo Ratings</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight leading-tight mb-4">
                Club Elo Leaderboard <span className="text-[#D4AF7C]">&</span> Standings
              </h1>
              <p className="text-sm sm:text-base text-[#A0A6B0] leading-relaxed mb-6 font-['Poppins',sans-serif]">
                Recognized collegiate ratings calculated after every official JGEC championship, rapid arena, and blitz night following standard FIDE Elo rating guidelines.
              </p>

              {/* Quick telemetry metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs text-[#A0A6B0] mb-0.5">Top Rating</div>
                  <div className="text-lg font-black font-mono text-[#D4AF7C]">
                    {loading ? '...' : maxRating > 0 ? `${maxRating} Elo` : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs text-[#A0A6B0] mb-0.5">Ranked Players</div>
                  <div className="text-lg font-black font-mono text-[#F5F5F5]">
                    {loading ? '...' : `${players.length} Active`}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs text-[#A0A6B0] mb-0.5">Peak Win Rate</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {loading ? '...' : bestDeptPlayer?.stats?.winRate ? `${bestDeptPlayer.stats.winRate}%` : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xs text-[#A0A6B0] mb-0.5">Rating Mode</div>
                  <div className="text-lg font-black font-mono text-[#F5F5F5] uppercase">
                    {ratingMode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP 3 PODIUM CARDS */}
        {topThree.length >= 3 && searchQuery === '' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF7C] font-bold">Hall of Fame</span>
              <h2 className="text-2xl sm:text-3xl font-black font-['Montserrat',sans-serif] mt-1 text-[#F5F5F5]">
                Collegiate Grandmaster Podium
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              
              {/* RANK 2 - SILVER */}
              {(() => {
                const plat = getPlayerPlatform(topThree[1]);
                return (
                  <div className="order-2 md:order-1 p-6 rounded-3xl bg-[#12161D] border border-slate-400/20 shadow-xl relative overflow-hidden group hover:border-slate-300/40 transition">
                    <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-slate-300/10 text-slate-300 border border-slate-300/30 flex items-center gap-1">
                      <Medal className="w-3.5 h-3.5 text-slate-300" />
                      <span>Rank #2</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 text-[#0B0F14] font-black text-2xl flex items-center justify-center font-mono mb-4 shadow-lg">
                      🥈
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                        {topThree[1].title || 'Candidate Master'}
                      </div>
                      {plat && (
                        <a
                          href={plat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold hover:brightness-125 transition inline-flex items-center gap-1 ${plat.color}`}
                        >
                          <span>{plat.platform}</span>
                          <span>@{plat.username}</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-[#F5F5F5] mb-1">
                      {topThree[1].name}
                    </h3>
                    <p className="text-xs text-[#A0A6B0] mb-4">
                      Official JGEC Lichess Squad • {topThree[1].title || 'Candidate Master'}
                    </p>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-[#A0A6B0] uppercase font-bold tracking-wider">
                          {plat?.platform || 'Lichess'} {ratingMode} Elo
                        </div>
                        <div className="text-xl font-black font-mono text-slate-200">{topThree[1].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#A0A6B0] uppercase">Win Rate</div>
                        <div className="text-sm font-bold font-mono text-emerald-400">{topThree[1].stats.matchesPlayed > 0 ? `${topThree[1].stats.winRate}%` : '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* RANK 1 - GOLD (CROWN) */}
              {(() => {
                const plat = getPlayerPlatform(topThree[0]);
                return (
                  <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-[#181D26] to-[#12161D] border-2 border-[#D4AF7C]/60 shadow-2xl relative overflow-hidden group transform md:-translate-y-4">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF7C] via-[#F3E5AB] to-[#D4AF7C]" />
                    <div className="absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full bg-[#D4AF7C]/20 text-[#D4AF7C] border border-[#D4AF7C]/40 flex items-center gap-1.5 shadow-lg">
                      <Crown className="w-4 h-4 text-[#D4AF7C]" />
                      <span>CLUB CHAMPION #1</span>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-black text-3xl flex items-center justify-center font-mono mb-4 shadow-xl shadow-[#D4AF7C]/20">
                      👑
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="text-xs font-bold text-[#D4AF7C] uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reigning Lichess Club Champion</span>
                      </div>
                      {plat && (
                        <a
                          href={plat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold hover:brightness-125 transition inline-flex items-center gap-1 ${plat.color}`}
                        >
                          <span>{plat.platform}</span>
                          <span>@{plat.username}</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <h3 className="text-2xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5] mb-1">
                      {topThree[0].name}
                    </h3>
                    <p className="text-xs text-[#A0A6B0] mb-4">
                      Official JGEC Lichess #1 Board • Reigning Champion
                    </p>

                    <div className="p-4 rounded-2xl bg-black/50 border border-[#D4AF7C]/20 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-[#A0A6B0] uppercase font-bold tracking-wider">
                          {plat?.platform || 'Lichess'} {ratingMode} Elo
                        </div>
                        <div className="text-2xl font-black font-mono text-[#D4AF7C]">{topThree[0].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#A0A6B0] uppercase">Win Ratio</div>
                        <div className="text-lg font-bold font-mono text-emerald-400">{topThree[0].stats.matchesPlayed > 0 ? `${topThree[0].stats.winRate}%` : '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* RANK 3 - BRONZE */}
              {(() => {
                const plat = getPlayerPlatform(topThree[2]);
                return (
                  <div className="order-3 md:order-3 p-6 rounded-3xl bg-[#12161D] border border-amber-700/30 shadow-xl relative overflow-hidden group hover:border-amber-600/40 transition">
                    <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center gap-1">
                      <Medal className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rank #3</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-[#0B0F14] font-black text-2xl flex items-center justify-center font-mono mb-4 shadow-lg">
                      🥉
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                        {topThree[2].title || 'Collegiate Master'}
                      </div>
                      {plat && (
                        <a
                          href={plat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold hover:brightness-125 transition inline-flex items-center gap-1 ${plat.color}`}
                        >
                          <span>{plat.platform}</span>
                          <span>@{plat.username}</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-['Montserrat',sans-serif] text-[#F5F5F5] mb-1">
                      {topThree[2].name}
                    </h3>
                    <p className="text-xs text-[#A0A6B0] mb-4">
                      Official JGEC Lichess Squad • {topThree[2].title || 'Collegiate Master'}
                    </p>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-[#A0A6B0] uppercase font-bold tracking-wider">
                          {plat?.platform || 'Club'} {ratingMode} Elo
                        </div>
                        <div className="text-xl font-black font-mono text-amber-400">{topThree[2].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#A0A6B0] uppercase">Win Rate</div>
                        <div className="text-sm font-bold font-mono text-emerald-400">{topThree[2].stats.matchesPlayed > 0 ? `${topThree[2].stats.winRate}%` : '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </section>
        )}

        {/* CONTROLS & FILTERS BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#12161D] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
            
            {/* Format Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setRatingMode('rapid')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  ratingMode === 'rapid'
                    ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] shadow'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Rapid (15+10)</span>
              </button>
              <button
                type="button"
                onClick={() => setRatingMode('blitz')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  ratingMode === 'blitz'
                    ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] shadow'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Blitz (3+2 / 5+0)</span>
              </button>
              <button
                type="button"
                onClick={() => setRatingMode('classical')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  ratingMode === 'classical'
                    ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] shadow'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Classical (60+30)</span>
              </button>
            </div>

            {/* Search & Sort Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by player name or chess ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
                  aria-label="Search players by name or chess handle"
                />
              </div>

              {/* Sort Switcher */}
              <div className="w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] cursor-pointer"
                  aria-label="Sort by metric"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="winRate">Sort by Win Rate</option>
                  <option value="matches">Sort by Matches Played</option>
                </select>
              </div>

            </div>
          </div>
        </section>

        {/* MAIN LEADERBOARD TABLE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#12161D] border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Mobile Horizontal Scroll Hint */}
            <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 text-[11px] text-[#A0A6B0]">
              <span className="flex items-center gap-1.5 text-[#D4AF7C] font-medium">
                <span>← Swipe table horizontally →</span>
              </span>
              <span className="font-mono text-[10px] text-white/50">7 Columns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-[#A0A6B0] font-semibold">
                    <th scope="col" className="py-4 px-4 sm:px-6 text-center w-16">Rank</th>
                    <th scope="col" className="py-4 px-4 sm:px-6">Lichess Player &amp; ID</th>
                    <th scope="col" className="py-4 px-4 text-right">Active Elo</th>
                    <th scope="col" className="py-4 px-4 text-center">Peak Rating</th>
                    <th scope="col" className="py-4 px-4 text-center">Win Rate</th>
                    <th scope="col" className="py-4 px-4 text-center">Recent Form</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-center">Achievements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <div className="w-7 h-7 rounded-xl bg-white/5 mx-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/10" />
                            <div className="space-y-1.5">
                              <div className="h-4 w-32 bg-white/10 rounded" />
                              <div className="h-3 w-20 bg-white/5 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-5 w-12 bg-white/10 rounded ml-auto" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-4 w-10 bg-white/5 rounded mx-auto" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-4 w-12 bg-white/5 rounded mx-auto" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-5 w-16 bg-white/5 rounded mx-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <div className="h-4 w-8 bg-white/5 rounded mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#A0A6B0]">
                        <div className="max-w-sm mx-auto space-y-2">
                          <p className="text-base font-semibold text-[#F5F5F5]">No players found</p>
                          <p className="text-xs">No active club ratings matching your current search.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player, idx) => {
                      const displayRank = idx + 1;
                      const isTop1 = displayRank === 1;
                      const isTop2 = displayRank === 2;
                      const isTop3 = displayRank === 3;
                      const plat = getPlayerPlatform(player);
                      const profileUrl = plat?.url || `https://lichess.org/@/${player.name}`;

                      return (
                        <tr 
                          key={player.id} 
                          className="hover:bg-white/[0.03] transition-colors group"
                        >
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono text-xs font-bold ${
                              isTop1 ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/30' :
                              isTop2 ? 'bg-slate-300 text-[#0B0F14]' :
                              isTop3 ? 'bg-amber-700 text-amber-100' :
                              'text-[#A0A6B0] bg-white/5'
                            }`}>
                              {displayRank}
                            </span>
                          </td>

                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${player.avatarColor} text-[#0B0F14] font-black text-sm flex items-center justify-center shadow`}>
                                {player.chessPiece === 'King' ? '♚' :
                                 player.chessPiece === 'Queen' ? '♛' :
                                 player.chessPiece === 'Rook' ? '♜' :
                                 player.chessPiece === 'Bishop' ? '♝' : '♞'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-[#F5F5F5] group-hover:text-[#D4AF7C] transition inline-flex items-center gap-1.5"
                                  >
                                    <span>{player.name}</span>
                                    <span className="text-[10px] text-[#A0A6B0] opacity-60">↗</span>
                                  </a>
                                  {player.title && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF7C]/15 text-[#D4AF7C] border border-[#D4AF7C]/30">
                                      {player.title}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#A0A6B0] font-mono flex items-center gap-2 mt-0.5 flex-wrap">
                                  <a
                                    href={profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono transition hover:brightness-125 ${
                                      plat?.color || 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                                    }`}
                                  >
                                    <span>{plat?.platform || 'Lichess'}:</span>
                                    <span className="font-semibold">@{plat?.username || player.lichessUsername || player.name}</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <span className="font-mono text-base font-black text-[#D4AF7C] block">
                              {player.rating[ratingMode]}
                            </span>
                            <span className="text-[10px] font-semibold uppercase text-[#A0A6B0]">
                              {ratingMode} Elo
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-xs text-[#A0A6B0]">
                            {player.rating.peak}
                          </td>

                          <td className="py-4 px-4 text-center">
                            {player.stats.matchesPlayed > 0 ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-bold text-emerald-400 text-xs">
                                  {player.stats.winRate}%
                                </span>
                                <div className="w-16 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-400 rounded-full" 
                                    style={{ width: `${player.stats.winRate}%` }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[#A0A6B0]/40 text-xs">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              {(player.recentForm && player.recentForm.length > 0) ? (
                                player.recentForm.map((f: string, i: number) => (
                                  <span
                                    key={i}
                                    className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center font-mono ${
                                      f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                      f === 'D' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}
                                    title={f === 'W' ? 'Win' : f === 'D' ? 'Draw' : 'Loss'}
                                  >
                                    {f}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[#A0A6B0]/40 text-xs">—</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 sm:px-6 text-center">
                            {player.stats.tournamentsWon > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF7C]">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>{player.stats.tournamentsWon}</span>
                              </span>
                            ) : (
                              <span className="text-[#A0A6B0]/40 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 sm:p-5 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A0A6B0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF7C]" />
                <span>Ratings calibrated per FIDE Handbook Section B02 (Collegiate Swiss Engine).</span>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  href="/register" 
                  className="text-[#D4AF7C] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Play next tournament to get rated</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
