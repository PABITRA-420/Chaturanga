'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLiveTournament } from '@/hooks/useLiveTournament';
import { RoundCountdownClock } from '@/components/chess/RoundCountdownClock';
import { PgnViewer } from '@/components/chess/PgnViewer';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { SEED_GAMES } from '@/lib/pgnParser';
import {
  Trophy,
  Clock,
  Radio,
  RefreshCw,
  Award,
  ChevronRight,
  Eye,
  ArrowLeft,
  MapPin,
  Flame,
  Search,
  Compass,
  Coffee,
  X,
} from 'lucide-react';

export interface LiveTournamentViewProps {
  tournamentId: string;
}

export const LiveTournamentView: React.FC<LiveTournamentViewProps> = ({ tournamentId }) => {
  const {
    tournament,
    currentRound,
    rounds,
    matches,
    standings,
    loading,
    isLiveSyncing,
    refetch,
  } = useLiveTournament(tournamentId);

  const [activeTab, setActiveTab] = useState<'boards' | 'standings' | 'featured'>('boards');
  const [selectedBoardNumber, setSelectedBoardNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedMatch = matches.find(m => m.board_number === selectedBoardNumber) || matches[0];

  const activePgn =
    selectedMatch?.pgn ||
    SEED_GAMES.find(g => g.tournament_id === tournamentId)?.pgn ||
    SEED_GAMES[0].pgn;

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.toLowerCase().trim();
    return matches.filter(
      m =>
        m.white_player_name.toLowerCase().includes(q) ||
        (m.black_player_name && m.black_player_name.toLowerCase().includes(q)) ||
        m.board_number.toString() === q
    );
  }, [matches, searchQuery]);

  const directHit = useMemo(() => {
    if (!searchQuery.trim() || filteredMatches.length === 0) return null;
    const q = searchQuery.toLowerCase().trim();
    return filteredMatches.find(
      m =>
        m.white_player_name.toLowerCase().includes(q) ||
        (m.black_player_name && m.black_player_name.toLowerCase().includes(q))
    ) || filteredMatches[0];
  }, [filteredMatches, searchQuery]);

  if (loading && !tournament) {
    return (
      <div className="space-y-8" data-testid="live-tournament-skeleton">
        <div className="p-6 sm:p-8 rounded-md bg-surface border border-border space-y-4">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-2/3 h-10" />
          <div className="flex gap-4">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-36 h-5" />
          </div>
        </div>
        <Skeleton className="w-full h-24" />
        <div className="flex gap-2">
          <Skeleton className="w-40 h-10" />
          <Skeleton className="w-40 h-10" />
          <Skeleton className="w-40 h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="live-tournament-view">
      {/* Broadcast Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-md bg-surface border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/upcoming"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-fg-muted hover:text-fg transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tournaments</span>
            </Link>
            <span className="text-border-strong">/</span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold text-danger bg-danger/10 border border-danger/30">
              <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" aria-hidden="true" />
              <span>LIVE BROADCAST</span>
            </span>

            {isLiveSyncing && (
              <span className="text-[10px] font-mono text-success flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" aria-hidden="true" /> Auto-syncing
              </span>
            )}
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-fg tracking-tight">
            {tournament?.title || 'Chaturanga Championship'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-fg-muted font-mono">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>{tournament?.format || 'Swiss System Rapid'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>{tournament?.venue || 'Main Auditorium, JGEC'}</span>
            </div>
            {currentRound && (
              <div className="flex items-center gap-1.5 text-fg font-semibold">
                <Flame className="w-4 h-4 text-warning" aria-hidden="true" />
                <span>Round {currentRound.round_number} of {rounds.length || 7}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-accent' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Central Live Clock Bar */}
      {currentRound && (
        <RoundCountdownClock
          startTime={currentRound.start_time}
          durationMinutes={currentRound.duration_minutes || 60}
          status={currentRound.status}
        />
      )}

      {/* Broadcast Tab Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto">
        {[
          { id: 'boards', label: `Active Board Pairings (${matches.length})`, icon: Radio },
          { id: 'standings', label: `Live Standings & Tiebreaks (${standings.length})`, icon: Award },
          { id: 'featured', label: 'Interactive Board (PGN Replay)', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xs text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-fg-muted hover:text-fg bg-surface hover:bg-surface-elevated border-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BOARDS PAIRING GRID */}
      {activeTab === 'boards' && (
        <div className="space-y-6">
          {matches.length > 0 ? (
            <>
              {/* Quick Board Finder */}
              <div
                data-testid="where-is-my-board-finder"
                className="p-5 rounded-md bg-surface border border-border-strong space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xs bg-surface-elevated border border-border flex items-center justify-center text-accent shrink-0">
                      <Compass className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-fg tracking-tight flex items-center gap-2 flex-wrap">
                        <span>Where Is My Board? Instant Quick Finder</span>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono text-warning bg-warning/10 border border-warning/30">
                          Live Round {currentRound?.round_number || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-fg-muted font-body">
                        Find your table number, assigned piece color, and opponent in one tap
                      </p>
                    </div>
                  </div>

                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
                    <input
                      type="text"
                      data-testid="board-search-input"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Type your name or board #..."
                      className="w-full pl-9 pr-8 py-2 rounded-xs bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg text-xs cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Hit Banner */}
                {searchQuery.trim() && directHit && (
                  <div
                    data-testid="board-direct-hit-banner"
                    className="mt-2 p-3.5 rounded-xs bg-accent/10 border border-accent/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
                      <div>
                        <span className="font-mono font-bold text-fg">Board {directHit.board_number}: </span>
                        <span className="text-accent font-semibold">{directHit.white_player_name}</span>
                        <span className="text-fg-muted text-[11px]"> (White) </span>
                        <span className="text-fg-muted">vs</span>{' '}
                        <span className="text-fg font-semibold">
                          {directHit.black_player_name || 'BYE'}
                        </span>
                        <span className="text-fg-muted text-[11px]"> (Black)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-fg-muted px-2 py-0.5 rounded-xs bg-surface border border-border">
                        {directHit.board_number <= 5
                          ? 'Auditorium Tier A (Boards 1-5)'
                          : directHit.board_number <= 15
                          ? 'Main Hall Center (Boards 6-15)'
                          : 'Main Hall Tier B (Boards 16+)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBoardNumber(directHit.board_number);
                          if (directHit.pgn) setActiveTab('featured');
                        }}
                        className="px-3 py-1.5 rounded-xs bg-accent hover:bg-accent-hover text-on-accent text-[11px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        {directHit.pgn ? 'Open PGN' : 'Select Board'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Board Cards Grid */}
              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map(m => {
                    const isSelected = selectedBoardNumber === m.board_number;
                    const isPending = m.result === 'pending';
                    const isBye = m.black_player_name === 'BYE' || m.result === '1-0_bye';
                    const zoneTag =
                      m.board_number <= 5
                        ? 'Auditorium Zone A'
                        : m.board_number <= 15
                        ? 'Auditorium Zone B'
                        : 'Hall Zone C';

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedBoardNumber(m.board_number);
                          if (m.pgn) setActiveTab('featured');
                        }}
                        className={`p-4 rounded-sm border transition-colors cursor-pointer relative overflow-hidden group text-left ${
                          isSelected
                            ? 'bg-surface-elevated border-accent'
                            : 'bg-surface border-border hover:border-border-strong'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-accent">
                              Board {m.board_number}
                            </span>
                            <span className="text-[10px] text-fg-muted font-mono hidden sm:inline-block">
                              • {zoneTag}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase border ${
                              isPending
                                ? 'bg-warning/10 text-warning border-warning/30'
                                : 'bg-success/10 text-success border-success/30'
                            }`}
                          >
                            {isPending ? 'In Progress' : m.result === '0.5-0.5' ? '½-½' : m.result}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-fg">
                              <span className="w-2.5 h-2.5 rounded-full bg-white border border-border-strong shrink-0" />
                              <span className="truncate max-w-[180px]">{m.white_player_name}</span>
                            </div>
                            <span className="font-mono font-bold text-fg tabular-nums">
                              {m.result === '1-0' || m.result === '1-0_bye' || m.result === '1F-0F'
                                ? '1'
                                : m.result === '0.5-0.5'
                                ? '½'
                                : isPending
                                ? '—'
                                : '0'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-fg">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] border border-border-strong shrink-0" />
                              <span
                                className={`truncate max-w-[180px] ${
                                  isBye ? 'text-warning italic' : ''
                                }`}
                              >
                                {m.black_player_name || 'BYE'}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-fg tabular-nums">
                              {m.result === '0-1' || m.result === '0F-1F'
                                ? '1'
                                : m.result === '0.5-0.5'
                                ? '½'
                                : isPending
                                ? '—'
                                : '0'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] font-mono text-fg-muted">
                          <span>{m.pgn ? 'PGN Available' : 'Digital Clock Sync'}</span>
                          <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" aria-hidden="true" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  data-testid="no-board-found-state"
                  className="p-10 text-center rounded-md bg-surface border border-border space-y-3"
                >
                  <Search className="w-8 h-8 text-accent mx-auto opacity-60" aria-hidden="true" />
                  <div className="text-sm font-bold text-fg">
                    No Board Found for &quot;{searchQuery}&quot;
                  </div>
                  <p className="text-xs text-fg-muted max-w-md mx-auto leading-relaxed font-body">
                    Double-check spelling or try searching by board number.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-1.5 rounded-xs text-xs font-mono font-semibold text-accent bg-surface-elevated border border-border hover:border-border-strong transition-colors cursor-pointer"
                  >
                    View All Active Boards
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              data-testid="pairings-preparing-state"
              className="p-12 text-center rounded-md bg-surface border border-border space-y-4"
            >
              <div className="w-12 h-12 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
                <Coffee className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-heading font-bold text-fg tracking-tight">
                  Round Pairings in Preparation
                </h3>
                <p className="text-xs text-fg-muted max-w-md mx-auto leading-relaxed font-body">
                  The Chief Arbiter desk is pairing the round according to FIDE Swiss regulations. Pairings will broadcast here in real time.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs text-[11px] font-mono text-warning bg-warning/10 border border-warning/30">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Desk Status: Verifying Player Check-ins &amp; Seeding</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE STANDINGS & TIEBREAKS */}
      {activeTab === 'standings' && (
        <div className="rounded-md border border-border bg-surface overflow-hidden">
          <div className="p-5 bg-surface-elevated border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-bold text-fg uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Collegiate FIDE Standings Crosstable</span>
              </h3>
              <p className="text-xs font-mono text-fg-muted mt-0.5">
                Tie-break order: Total Points → Buchholz Cut 1 → Direct Encounter → Sonneborn-Berger
              </p>
            </div>
          </div>

          {standings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-[11px] font-mono uppercase tracking-wider text-accent font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4 font-mono text-center">Points</th>
                    <th className="py-3 px-4 font-mono text-center">Played</th>
                    <th className="py-3 px-4 font-mono text-center">Buchholz Cut 1</th>
                    <th className="py-3 px-4 font-mono text-center">Sonneborn-Berger</th>
                    <th className="py-3 px-4 font-mono text-center">Buchholz (Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {standings.map(s => {
                    const isPodium = s.rank <= 3;
                    const rankBadge =
                      s.rank === 1 ? '🥇 1st' : s.rank === 2 ? '🥈 2nd' : s.rank === 3 ? '🥉 3rd' : `#${s.rank}`;

                    return (
                      <tr
                        key={s.playerId}
                        className={`hover:bg-surface-elevated transition-colors ${
                          isPodium ? 'bg-accent/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono font-bold text-accent">
                          {rankBadge}
                        </td>
                        <td className="py-3 px-4 font-semibold text-fg">
                          <span>{s.playerName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-center text-accent text-sm tabular-nums">
                          {s.points}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-fg tabular-nums">
                          {s.matchesPlayed}
                        </td>
                        <td className="py-3 px-4 font-mono text-center font-bold text-fg tabular-nums">
                          {s.tieBreaks.buchholzCut1}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-fg-muted tabular-nums">
                          {s.tieBreaks.sonnebornBerger}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-fg-muted tabular-nums">
                          {s.tieBreaks.buchholz}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              data-testid="standings-inactive-state"
              className="p-12 text-center space-y-3 bg-surface"
            >
              <div className="w-12 h-12 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
                <Trophy className="w-6 h-6 opacity-60" aria-hidden="true" />
              </div>
              <div className="text-sm font-bold text-fg">Standings Crosstable Inactive</div>
              <p className="text-xs text-fg-muted max-w-md mx-auto leading-relaxed font-body">
                Collegiate FIDE standings and Buchholz tiebreak calculations will automatically populate as soon as Round 1 matches conclude.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEATURED INTERACTIVE PGN BOARD */}
      {activeTab === 'featured' && (
        <div className="space-y-4">
          <PgnViewer
            pgn={activePgn}
            title={`${tournament?.title || 'Tournament'} • Board ${selectedBoardNumber}`}
          />
        </div>
      )}
    </div>
  );
};
