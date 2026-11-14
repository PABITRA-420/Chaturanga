'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
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
  ArrowUp,
  ChevronDown,
  Users,
} from 'lucide-react';
import { LeaderboardPlayer } from '@/types/leaderboard';

export default function LeaderboardView() {
  const [ratingMode, setRatingMode] = useState<'rapid' | 'blitz' | 'classical'>('rapid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'winRate' | 'matches'>('rating');

  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [showElevator, setShowElevator] = useState<boolean>(false);

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

  React.useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, ratingMode, sortBy]);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isOver = window.scrollY > 280;
          setShowElevator(prev => (prev !== isOver ? isOver : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTopBoard = () => {
    const tableEl = document.getElementById('leaderboard-table');
    if (tableEl) {
      const yOffset = -90;
      const y = tableEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const displayedPlayers = useMemo(() => {
    return filteredPlayers.slice(0, visibleCount);
  }, [filteredPlayers, visibleCount]);

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
        color: 'text-info bg-info/10 border-info/30',
      };
    }
    if (p.chessComUsername || p.chessUsername) {
      const handle = p.chessComUsername || p.chessUsername;
      return {
        platform: 'Chess.com',
        username: handle,
        url: `https://www.chess.com/member/${handle}`,
        color: 'text-success bg-success/10 border-success/30',
      };
    }
    return null;
  };

  const getChessPieceGlyph = (piece?: string) => {
    switch (piece) {
      case 'King': return '♚';
      case 'Queen': return '♛';
      case 'Rook': return '♜';
      case 'Bishop': return '♝';
      default: return '♞';
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg font-ui selection:bg-accent selection:text-on-accent">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="p-7 sm:p-10 rounded-md bg-surface border border-border">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>OFFICIAL JGEC CLUB ELO RATINGS</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight leading-tight">
                Club Elo Leaderboard <span className="text-accent">&amp;</span> Standings
              </h1>
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed font-body">
                Recognized collegiate ratings calculated after every official JGEC championship, rapid arena, and blitz night following standard FIDE Elo guidelines.
              </p>

              {/* Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-border rounded-sm bg-surface-elevated divide-y sm:divide-y-0 sm:divide-x divide-border mt-4">
                <div className="p-3.5">
                  <div className="text-[10px] font-mono uppercase text-fg-muted mb-0.5">Top Rating</div>
                  <div className="text-lg font-extrabold font-mono text-accent tabular-nums">
                    {loading ? '...' : maxRating > 0 ? `${maxRating} Elo` : '—'}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="text-[10px] font-mono uppercase text-fg-muted mb-0.5">Ranked Players</div>
                  <div className="text-lg font-extrabold font-mono text-fg tabular-nums">
                    {loading ? '...' : `${players.length} Active`}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="text-[10px] font-mono uppercase text-fg-muted mb-0.5">Peak Win Rate</div>
                  <div className="text-lg font-extrabold font-mono text-success tabular-nums">
                    {loading ? '...' : bestDeptPlayer?.stats?.winRate ? `${bestDeptPlayer.stats.winRate}%` : '—'}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="text-[10px] font-mono uppercase text-fg-muted mb-0.5">Rating Mode</div>
                  <div className="text-lg font-extrabold font-mono text-fg uppercase">
                    {ratingMode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP 3 PODIUM CARDS */}
        {topThree.length >= 3 && searchQuery === '' && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="mb-6 border-b border-border pb-3 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Hall of Fame</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading mt-0.5 text-fg">
                  Collegiate Grandmaster Podium
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              
              {/* RANK 2 - SILVER */}
              {(() => {
                const plat = getPlayerPlatform(topThree[1]);
                return (
                  <div className="order-2 md:order-1 p-6 rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-sm bg-surface-elevated border border-border text-fg font-bold text-sm flex items-center justify-center font-mono">
                          #02
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xs bg-surface-elevated text-fg-muted border border-border flex items-center gap-1.5">
                          <Medal className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Silver</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-fg-muted uppercase tracking-wider">
                          {topThree[1].title || 'Candidate Master'}
                        </span>
                        {plat && (
                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] px-2 py-0.5 rounded-xs border font-mono font-bold hover:underline inline-flex items-center gap-1 ${plat.color}`}
                          >
                            <span>{plat.platform}</span>
                            <span>@{plat.username}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                      <h3 className="text-xl font-bold font-heading text-fg mb-1">
                        {topThree[1].name}
                      </h3>
                      <p className="text-xs text-fg-muted font-body mb-4">
                        Official JGEC Lichess Squad • {topThree[1].title || 'Candidate Master'}
                      </p>
                    </div>

                    <div className="p-3 rounded-sm bg-surface-elevated border border-border flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-fg-muted uppercase font-bold">
                          {plat?.platform || 'Lichess'} {ratingMode} Elo
                        </div>
                        <div className="text-xl font-extrabold font-mono text-fg tabular-nums">{topThree[1].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-fg-muted uppercase">Win Rate</div>
                        <div className="text-sm font-bold font-mono text-success tabular-nums">
                          {topThree[1].stats.matchesPlayed > 0 ? `${topThree[1].stats.winRate}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* RANK 1 - CHAMPION */}
              {(() => {
                const plat = getPlayerPlatform(topThree[0]);
                return (
                  <div className="order-1 md:order-2 p-7 rounded-md bg-surface border-2 border-accent flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-sm bg-accent text-on-accent font-extrabold text-sm flex items-center justify-center font-mono">
                          #01
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xs bg-accent text-on-accent flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>CHAMPION</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                          Reigning Club Champion
                        </span>
                        {plat && (
                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] px-2 py-0.5 rounded-xs border font-mono font-bold hover:underline inline-flex items-center gap-1 ${plat.color}`}
                          >
                            <span>{plat.platform}</span>
                            <span>@{plat.username}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                      <h3 className="text-2xl font-extrabold font-heading text-fg mb-1">
                        {topThree[0].name}
                      </h3>
                      <p className="text-xs text-fg-muted font-body mb-4">
                        Official JGEC #1 Board • Reigning Champion
                      </p>
                    </div>

                    <div className="p-3.5 rounded-sm bg-surface-elevated border border-accent/40 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-mono text-fg-muted uppercase font-bold">
                          {plat?.platform || 'Lichess'} {ratingMode} Elo
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-accent tabular-nums">{topThree[0].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-fg-muted uppercase">Win Ratio</div>
                        <div className="text-lg font-bold font-mono text-success tabular-nums">
                          {topThree[0].stats.matchesPlayed > 0 ? `${topThree[0].stats.winRate}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* RANK 3 - BRONZE */}
              {(() => {
                const plat = getPlayerPlatform(topThree[2]);
                return (
                  <div className="order-3 md:order-3 p-6 rounded-md bg-surface border border-border hover:border-border-strong flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-sm bg-surface-elevated border border-warning/40 text-warning font-bold text-sm flex items-center justify-center font-mono">
                          #03
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xs bg-warning/10 text-warning border border-warning/30 flex items-center gap-1.5">
                          <Medal className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Bronze</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-warning uppercase tracking-wider">
                          {topThree[2].title || 'Collegiate Master'}
                        </span>
                        {plat && (
                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] px-2 py-0.5 rounded-xs border font-mono font-bold hover:underline inline-flex items-center gap-1 ${plat.color}`}
                          >
                            <span>{plat.platform}</span>
                            <span>@{plat.username}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                      <h3 className="text-xl font-bold font-heading text-fg mb-1">
                        {topThree[2].name}
                      </h3>
                      <p className="text-xs text-fg-muted font-body mb-4">
                        Official JGEC Lichess Squad • {topThree[2].title || 'Collegiate Master'}
                      </p>
                    </div>

                    <div className="p-3 rounded-sm bg-surface-elevated border border-border flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-fg-muted uppercase font-bold">
                          {plat?.platform || 'Club'} {ratingMode} Elo
                        </div>
                        <div className="text-xl font-extrabold font-mono text-warning tabular-nums">{topThree[2].rating[ratingMode]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-fg-muted uppercase">Win Rate</div>
                        <div className="text-sm font-bold font-mono text-success tabular-nums">
                          {topThree[2].stats.matchesPlayed > 0 ? `${topThree[2].stats.winRate}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </section>
        )}

        {/* CONTROLS & FILTERS BAR */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Format Selector */}
            <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-elevated border border-border w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setRatingMode('rapid')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  ratingMode === 'rapid'
                    ? 'bg-primary text-on-primary'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Rapid (15+10)</span>
              </button>
              <button
                type="button"
                onClick={() => setRatingMode('blitz')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  ratingMode === 'blitz'
                    ? 'bg-primary text-on-primary'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Blitz (3+2 / 5+0)</span>
              </button>
              <button
                type="button"
                onClick={() => setRatingMode('classical')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  ratingMode === 'classical'
                    ? 'bg-primary text-on-primary'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Classical (60+30)</span>
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-fg-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by player name or chess ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                  aria-label="Search players by name or chess handle"
                />
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-sm bg-bg border border-border text-xs text-fg focus:border-border-strong cursor-pointer"
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
        <section id="leaderboard-table" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-surface border border-border overflow-hidden">
            
            <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-border text-[11px] font-mono text-fg-muted">
              <span className="text-accent font-medium">← Swipe table horizontally →</span>
              <span className="text-[10px]">7 Columns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-[11px] font-mono uppercase tracking-wider text-fg-muted font-semibold">
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-center w-16">Rank</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Player &amp; Handle</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Active Elo</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Peak Rating</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Win Rate</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Recent Form</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">Titles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {loading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i}>
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <Skeleton className="w-7 h-7 mx-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-9 h-9 shrink-0" />
                            <div className="space-y-1.5 flex-1">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
                        <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                        <td className="py-4 px-4 text-center"><Skeleton className="h-4 w-14 mx-auto" /></td>
                        <td className="py-4 px-4 text-center"><Skeleton className="h-5 w-16 mx-auto" /></td>
                        <td className="py-4 px-4 sm:px-6 text-center"><Skeleton className="h-4 w-10 mx-auto" /></td>
                      </tr>
                    ))
                  ) : filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-fg-muted">
                        <div className="max-w-sm mx-auto space-y-2">
                          <p className="text-base font-semibold text-fg">No players found</p>
                          <p className="text-xs">No active club ratings matching your current search.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedPlayers.map((player, idx) => {
                      const displayRank = idx + 1;
                      const isTop1 = displayRank === 1;
                      const isTop2 = displayRank === 2;
                      const isTop3 = displayRank === 3;
                      const plat = getPlayerPlatform(player);
                      const profileUrl = plat?.url;

                      return (
                        <tr
                          key={player.id}
                          className="hover-row transition-colors group"
                        >
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xs font-mono text-xs font-bold tabular-nums ${
                              isTop1 ? 'bg-accent text-on-accent' :
                              isTop2 ? 'bg-primary text-on-primary' :
                              isTop3 ? 'bg-warning/20 text-warning border border-warning/40' :
                              'text-fg-muted bg-surface-elevated border border-border'
                            }`}>
                              {displayRank}
                            </span>
                          </td>

                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xs bg-surface-elevated border border-border text-accent font-serif text-base flex items-center justify-center shrink-0">
                                {getChessPieceGlyph(player.chessPiece)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {profileUrl ? (
                                    <a
                                      href={profileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-bold text-fg hover:text-accent transition-colors inline-flex items-center gap-1"
                                    >
                                      <span>{player.name}</span>
                                      <span className="text-[10px] text-fg-muted" aria-hidden="true">↗</span>
                                    </a>
                                  ) : (
                                    <span className="font-bold text-fg">{player.name}</span>
                                  )}
                                  {player.title && (
                                    <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                                      {player.title}
                                    </span>
                                  )}
                                </div>
                                {plat && (
                                  <div className="text-xs text-fg-muted font-mono flex items-center gap-2 mt-0.5 flex-wrap">
                                    <a
                                      href={plat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs border font-mono hover:underline ${plat.color}`}
                                    >
                                      <span>{plat.platform}:</span>
                                      <span className="font-semibold">@{plat.username}</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <span className="font-mono text-base font-extrabold text-accent block tabular-nums">
                              {player.rating[ratingMode]}
                            </span>
                            <span className="text-[10px] font-mono font-semibold uppercase text-fg-muted">
                              {ratingMode} Elo
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-xs text-fg-muted tabular-nums">
                            {player.rating.peak}
                          </td>

                          <td className="py-4 px-4 text-center">
                            {player.stats.matchesPlayed > 0 ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-bold text-success text-xs tabular-nums">
                                  {player.stats.winRate}%
                                </span>
                                <div className="w-16 h-1 bg-border mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-success"
                                    style={{ width: `${player.stats.winRate}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-fg-muted opacity-50 text-xs">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              {(player.recentForm && player.recentForm.length > 0) ? (
                                player.recentForm.map((f: string, i: number) => (
                                  <span
                                    key={i}
                                    className={`w-5 h-5 rounded-xs text-[10px] font-bold flex items-center justify-center font-mono border ${
                                      f === 'W' ? 'bg-success/10 text-success border-success/30' :
                                      f === 'D' ? 'bg-warning/10 text-warning border-warning/30' :
                                      'bg-danger/10 text-danger border-danger/30'
                                    }`}
                                    title={f === 'W' ? 'Win' : f === 'D' ? 'Draw' : 'Loss'}
                                  >
                                    {f}
                                  </span>
                                ))
                              ) : (
                                <span className="text-fg-muted opacity-50 text-xs">—</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 sm:px-6 text-center">
                            {player.stats.tournamentsWon > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-accent tabular-nums">
                                <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{player.stats.tournamentsWon}</span>
                              </span>
                            ) : (
                              <span className="text-fg-muted opacity-50 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* LOAD MORE CONTROLS */}
            {!loading && filteredPlayers.length > 0 && (
              <div className="p-5 sm:p-6 bg-surface-elevated border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 w-full sm:w-auto text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-fg-muted">
                    <Users className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>
                      Showing <strong className="text-fg">{displayedPlayers.length}</strong> of{' '}
                      <strong className="text-accent">{filteredPlayers.length}</strong> ranked contenders
                    </span>
                  </div>
                  <div className="w-full sm:w-64 h-1 bg-border overflow-hidden mx-auto sm:mx-0">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${Math.min(100, (displayedPlayers.length / filteredPlayers.length) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                  {visibleCount < filteredPlayers.length ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => Math.min(prev + 10, filteredPlayers.length))}
                        className="px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors flex items-center gap-2 btn-tactile cursor-pointer"
                      >
                        <span>Load 10 More (+10)</span>
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibleCount(filteredPlayers.length)}
                        className="px-4 py-2.5 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface border border-border hover:border-border-strong transition-colors cursor-pointer"
                      >
                        <span>Show All ({filteredPlayers.length})</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-success font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
                        All {filteredPlayers.length} contenders loaded
                      </span>
                      {filteredPlayers.length > 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            setVisibleCount(10);
                            scrollToTopBoard();
                          }}
                          className="px-3.5 py-1.5 rounded-xs text-xs font-mono text-fg-muted hover:text-fg bg-surface border border-border hover:border-border-strong transition-colors cursor-pointer"
                        >
                          Collapse to Top 10
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Table Footer */}
            <div className="p-4 sm:p-5 bg-surface border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-muted font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Ratings calibrated per FIDE Handbook Section B02.</span>
              </div>
              <Link
                href="/register"
                className="text-accent hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Play next tournament to get rated</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

          </div>
        </section>

        {/* NON-OVERLAPPING TOP BOARD ELEVATOR (Bottom Left) */}
        {showElevator && (
          <aside
            aria-label="Leaderboard quick navigation elevator"
            className="fixed left-5 sm:left-6 bottom-20 md:bottom-6 z-40"
          >
            <button
              type="button"
              onClick={scrollToTopBoard}
              style={{ boxShadow: 'var(--shadow-md)' }}
              className="px-3.5 py-2.5 rounded-sm bg-surface hover:bg-surface-elevated border border-border-strong text-fg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer btn-tactile"
              title="Jump to #1 Top Board"
            >
              <Crown className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span className="hidden sm:inline">Top Board</span>
              <span className="sm:hidden">#1</span>
              <ArrowUp className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            </button>
          </aside>
        )}

      </main>

      <Footer />
    </div>
  );
}
