'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveTournament } from '@/hooks/useLiveTournament';
import { RoundCountdownClock } from '@/components/chess/RoundCountdownClock';
import { PgnViewer } from '@/components/chess/PgnViewer';
import { SEED_GAMES } from '@/lib/pgnParser';
import {
  Trophy,
  Users,
  Clock,
  Radio,
  RefreshCw,
  Award,
  ChevronRight,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  Flame,
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
    error,
    lastSyncedAt,
    refetch,
  } = useLiveTournament(tournamentId);

  const [activeTab, setActiveTab] = useState<'boards' | 'standings' | 'featured'>('boards');
  const [selectedBoardNumber, setSelectedBoardNumber] = useState<number>(1);

  // Selected match for live inspection
  const selectedMatch = matches.find(m => m.board_number === selectedBoardNumber) || matches[0];

  // Active PGN to display in viewer: from selected match, or tournament seed, or default
  const activePgn =
    selectedMatch?.pgn ||
    SEED_GAMES.find(g => g.tournament_id === tournamentId)?.pgn ||
    SEED_GAMES[0].pgn;

  if (loading && !tournament) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-[#D4AF7C]">
        <div className="w-10 h-10 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A0A6B0] font-mono tracking-widest uppercase">
          Connecting to Live Tournament Broadcast...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="live-tournament-view">
      {/* Top Breadcrumb & Live Broadcast Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121620] via-[#0E121A] to-[#080B10] border border-[#D4AF7C]/30 shadow-2xl relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/upcoming"
              className="inline-flex items-center gap-1.5 text-xs text-[#A0A6B0] hover:text-white transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tournaments</span>
            </Link>
            <span className="text-white/20">•</span>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold text-red-400 bg-red-950/40 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE BROADCAST</span>
            </span>

            {isLiveSyncing && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Auto-syncing
              </span>
            )}
          </div>

          <h1 className="font-['Montserrat',sans-serif] text-2xl sm:text-4xl font-black text-white tracking-tight">
            {tournament?.title || 'Chaturanga Championship'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A0A6B0]">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#D4AF7C]" />
              <span>{tournament?.format || 'Swiss System Rapid'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D4AF7C]" />
              <span>{tournament?.venue || 'Main Auditorium, JGEC'}</span>
            </div>
            {currentRound && (
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Round {currentRound.round_number} of {rounds.length || 7}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sync Status Button */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-[#D4AF7C]' : ''}`} />
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
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
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#D4AF7C] text-black shadow-lg shadow-[#D4AF7C]/20'
                  : 'text-[#A0A6B0] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BOARDS PAIRING GRID */}
      {activeTab === 'boards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => {
              const isSelected = selectedBoardNumber === m.board_number;
              const isPending = m.result === 'pending';
              const isBye = m.black_player_name === 'BYE' || m.result === '1-0_bye';

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedBoardNumber(m.board_number);
                    if (m.pgn) setActiveTab('featured');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] ${
                    isSelected
                      ? 'bg-[#151B26] border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/10'
                      : 'bg-[#0E121A] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top: Board Number & Result Status */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/5 text-xs">
                    <span className="font-mono font-bold text-[#D4AF7C]">
                      Board {m.board_number}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isPending ? 'In Progress' : m.result === '0.5-0.5' ? '½-½' : m.result}
                    </span>
                  </div>

                  {/* Players Matchup */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                        <span className="truncate max-w-[180px]">{m.white_player_name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-300">
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
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
                        <span className={`truncate max-w-[180px] ${isBye ? 'text-amber-400/80 italic' : ''}`}>
                          {m.black_player_name || 'BYE'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-300">
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

                  {/* Bottom Action Hint */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A0A6B0]">
                    <span>{m.pgn ? 'PGN Available' : 'Live Digital Board'}</span>
                    <span className="text-[#D4AF7C] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {matches.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#0E121A] border border-white/10 space-y-2">
              <Clock className="w-8 h-8 text-[#D4AF7C]/40 mx-auto" />
              <div className="text-sm font-bold text-white">Pairings Under Preparation</div>
              <p className="text-xs text-[#A0A6B0]">
                The Chief Arbiter is compiling Round pairings. This view will automatically update.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE STANDINGS & TIEBREAKS */}
      {activeTab === 'standings' && (
        <div className="rounded-3xl border border-white/10 bg-[#0E121A] overflow-hidden shadow-2xl">
          <div className="p-5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#D4AF7C]" />
                <span>Collegiate FIDE Standings Crosstable</span>
              </h3>
              <p className="text-xs text-[#A0A6B0] mt-0.5">
                Tie-break order: Total Points → Buchholz Cut 1 → Direct Encounter → Sonneborn-Berger
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-[#D4AF7C] font-semibold border-b border-white/10">
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
              <tbody className="divide-y divide-white/5">
                {standings.map(s => {
                  const isPodium = s.rank <= 3;
                  const rankBadge =
                    s.rank === 1 ? '🥇 1st' : s.rank === 2 ? '🥈 2nd' : s.rank === 3 ? '🥉 3rd' : `#${s.rank}`;

                  return (
                    <tr
                      key={s.playerId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isPodium ? 'bg-[#D4AF7C]/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold text-[#D4AF7C]">
                        {rankBadge}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <span>{s.playerName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-center text-amber-300 text-sm">
                        {s.points}
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-slate-300">
                        {s.matchesPlayed}
                      </td>
                      <td className="py-3 px-4 font-mono text-center font-bold text-slate-200">
                        {s.tieBreaks.buchholzCut1}
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-slate-400">
                        {s.tieBreaks.sonnebornBerger}
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-slate-400">
                        {s.tieBreaks.buchholz}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
