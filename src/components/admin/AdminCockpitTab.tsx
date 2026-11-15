'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tournament, Participant } from '@/types/tournament';
import {
  TournamentMatch,
  TournamentRound,
  PlayerStanding,
  MatchResult,
} from '@/types/pairing';
import { PodiumCelebration } from '@/components/PodiumCelebration';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import {
  Trophy,
  Swords,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  Award,
  ChevronDown,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface AdminCockpitTabProps {
  tournaments: Tournament[];
  participants: Participant[];
  onCheckIn?: (ticketId: string, currentStatus: string) => Promise<void>;
  onTournamentUpdated?: (updated: Tournament) => void;
}

export default function AdminCockpitTab({
  tournaments,
  participants,
  onCheckIn,
  onTournamentUpdated,
}: AdminCockpitTabProps) {
  // Selected Tournament
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(() => {
    const live = tournaments.find(t => t.status === 'open' || t.status === 'upcoming') || tournaments[0];
    return live?.id || '';
  });

  const activeTournament = useMemo(() => {
    return tournaments.find(t => t.id === selectedTournamentId) || tournaments[0] || null;
  }, [tournaments, selectedTournamentId]);

  // Pairings & Rounds state
  const [rounds, setRounds] = useState<TournamentRound[]>([]);
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(1);
  const [loadingPairings, setLoadingPairings] = useState<boolean>(false);
  const [recordingScoreId, setRecordingScoreId] = useState<string | null>(null);

  // Fast Check-In Roster search state
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Round Clock State
  const [clockSeconds, setClockSeconds] = useState<number>(15 * 60); // 15 mins default
  const [clockRunning, setClockRunning] = useState<boolean>(false);

  // Notice alert banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load pairings for the selected tournament
  const loadPairings = useCallback(async (tournId: string) => {
    if (!tournId) return;
    setLoadingPairings(true);
    try {
      const res = await fetch(`/api/tournaments/${tournId}/pairings`);
      const data = await res.json();
      if (data.success) {
        setRounds(data.rounds || []);
        setStandings(data.standings || []);
        if (data.rounds && data.rounds.length > 0) {
          const current = data.rounds.find((r: TournamentRound) => r.status === 'in_progress') ||
            data.rounds[data.rounds.length - 1];
          setActiveRoundNumber(current.round_number);
        }
      }
    } catch (err) {
      console.warn('Failed to load cockpit pairings:', err);
    } finally {
      setLoadingPairings(false);
    }
  }, []);

  useEffect(() => {
    if (activeTournament?.id) {
      loadPairings(activeTournament.id);
    }
  }, [activeTournament?.id, loadPairings]);

  // Round Timer Interval
  useEffect(() => {
    if (!clockRunning) return;
    const interval = setInterval(() => {
      setClockSeconds(prev => {
        if (prev <= 1) {
          setClockRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [clockRunning]);

  const formatClockTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Active round data
  const currentRound = useMemo(() => {
    return rounds.find(r => r.round_number === activeRoundNumber) || rounds[rounds.length - 1] || null;
  }, [rounds, activeRoundNumber]);

  // Matches in the active round
  const activeMatches = currentRound?.matches || [];
  const completedMatches = activeMatches.filter(m => m.result !== 'pending').length;
  const totalMatches = activeMatches.length;
  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  // Filtered Roster for Fast Check-In
  const eventParticipants = useMemo(() => {
    if (!activeTournament) return [];
    return participants.filter(p => {
      const pTourn = (p.tournament || '').trim().toLowerCase();
      const aTourn = (activeTournament.title || '').trim().toLowerCase();
      return pTourn === aTourn || p.tournamentId === activeTournament.id;
    });
  }, [participants, activeTournament]);

  const searchResults = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return eventParticipants.slice(0, 6);
    return eventParticipants.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.rollNumber.toLowerCase().includes(q) ||
      p.ticketId.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [eventParticipants, rosterSearch]);

  // Handle Score Recording
  const handleRecordScore = async (matchId: string, result: MatchResult) => {
    if (!activeTournament) return;
    setRecordingScoreId(matchId);
    try {
      const res = await fetch(`/api/tournaments/${activeTournament.id}/pairings/matches`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, result }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local matches state
        setRounds(prev => prev.map(rnd => {
          if (rnd.round_number !== activeRoundNumber) return rnd;
          return {
            ...rnd,
            matches: (rnd.matches || []).map(m => m.id === matchId ? { ...m, result } : m),
          };
        }));
        // Reload standings
        loadPairings(activeTournament.id);
        setNotice({ type: 'success', message: `Board result ${result} saved successfully.` });
      } else {
        setNotice({ type: 'error', message: data.error || 'Failed to record board score.' });
      }
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Error updating board score.' });
    } finally {
      setRecordingScoreId(null);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  // Handle Fast Check-In Toggle
  const handleFastCheckIn = async (participant: Participant) => {
    if (!onCheckIn) return;
    setCheckingInId(participant.ticketId);
    try {
      const current = participant.checkInStatus || 'registered';
      await onCheckIn(participant.ticketId, current);
      setNotice({
        type: 'success',
        message: `${participant.name} (${participant.rollNumber}) status updated.`,
      });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to update check-in status.' });
    } finally {
      setCheckingInId(null);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-cockpit">
      {/* 1. TOURNAMENT SELECTOR & STATUS STRIP */}
      <div className="p-6 rounded-md bg-surface border border-border-strong shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-semibold text-accent bg-accent/10 border border-accent/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ALL-IN-ONE ARBITER COCKPIT • SINGLE PANE OF GLASS</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-fg tracking-tight">
            {activeTournament?.title || 'Championship Arena'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
            <span>Format: <strong className="text-fg">{activeTournament?.format || 'Swiss Rapid'}</strong></span>
            <span>•</span>
            <span>Venue: <strong className="text-fg">{activeTournament?.venue || 'Main Auditorium'}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-success/10 border border-success/30 text-success font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Round {activeRoundNumber} Live
            </span>
          </div>
        </div>

        {/* Tournament Switcher Dropdown */}
        <div className="w-full md:w-80 z-10 space-y-1.5">
          <label htmlFor="cockpit-tournament-select" className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-fg-muted">
            Active Event Cockpit
          </label>
          <div className="relative">
            <select
              id="cockpit-tournament-select"
              value={selectedTournamentId}
              onChange={e => setSelectedTournamentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-xs font-semibold text-fg focus:border-accent appearance-none cursor-pointer pr-10 transition-colors"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id} className="bg-surface text-fg">
                  {t.title} {t.status === 'open' ? '(Live Open)' : t.status === 'completed' ? '(Finished)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-fg-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Floating Notice Banner */}
      {notice && (
        <div
          role="status"
          className={`p-4 rounded-sm border text-xs flex items-center justify-between gap-3 transition-colors ${
            notice.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            )}
            <span className="font-semibold">{notice.message}</span>
          </div>
        </div>
      )}

      {/* 2. MAIN COCKPIT GRID (65% Matches Hub / 35% Quick Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT DECK: LIVE MATCHES & RAPID SCORING (7 Columns) */}
        <section className="lg:col-span-7 space-y-5">
          <div className="p-5 sm:p-6 rounded-md bg-surface border border-border shadow-xs space-y-5">
            {/* Matches Header & Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
                  <Swords className="w-4 h-4 text-accent" />
                  <span>Round {activeRoundNumber} Match Scoring Desk</span>
                </h3>
                <p className="text-xs text-fg-muted mt-0.5">
                  1-Click rapid score recorder for arbiters. Updates live standings instantly.
                </p>
              </div>

              {/* Round Switcher Tabs */}
              {rounds.length > 1 && (
                <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-elevated border border-border overflow-x-auto">
                  {rounds.map(r => (
                    <button
                      key={r.round_number}
                      type="button"
                      onClick={() => setActiveRoundNumber(r.round_number)}
                      className={`px-2.5 py-1 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer ${
                        activeRoundNumber === r.round_number
                          ? 'bg-accent text-on-accent'
                          : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                      }`}
                    >
                      R{r.round_number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Round Completion Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-fg-muted">Round Completion</span>
                <span className="text-accent font-bold">
                  {completedMatches} / {totalMatches} Boards ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-xs bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Board Matches List */}
            {loadingPairings ? (
              <SkeletonTable rows={4} columns={4} />
            ) : activeMatches.length === 0 ? (
              <div className="p-8 text-center rounded-sm bg-surface-elevated border border-border space-y-2">
                <Clock className="w-7 h-7 text-accent/60 mx-auto" />
                <h4 className="font-heading text-sm font-bold text-fg">No Pairings Generated for Round {activeRoundNumber}</h4>
                <p className="text-xs text-fg-muted max-w-sm mx-auto">
                  Accredit registered participants at the right desk, then generate Round {activeRoundNumber} pairings.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMatches.map(match => {
                  const isScoring = recordingScoreId === match.id;
                  const isBye = !match.black_player_name || match.result === '1-0_bye';

                  return (
                    <div
                      key={match.id}
                      className="p-3.5 sm:p-4 rounded-sm bg-surface-elevated border border-border hover:border-border-strong transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Board Indicator */}
                        <div className="w-9 h-9 rounded-sm bg-surface border border-border flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] uppercase text-fg-subtle font-mono font-semibold leading-none">B</span>
                          <span className="font-mono text-sm font-bold text-accent leading-none mt-0.5 tabular-nums">
                            {match.board_number}
                          </span>
                        </div>

                        {/* Players */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-xs bg-white border border-border-strong shrink-0" />
                              <span className="truncate text-fg">{match.white_player_name}</span>
                            </span>
                            <span className="text-xs text-fg-subtle font-mono font-normal px-2">vs</span>
                            <span className="flex items-center gap-1.5 truncate justify-end">
                              <span className="truncate text-fg-muted">
                                {isBye ? 'BYE (1 Pt)' : match.black_player_name}
                              </span>
                              {!isBye && (
                                <span className="w-2 h-2 rounded-xs bg-zinc-900 border border-border-strong shrink-0" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Current Status Pill */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[11px] font-mono font-bold border ${
                              match.result === '1-0'
                                ? 'bg-success/15 text-success border-success/30'
                                : match.result === '0-1'
                                ? 'bg-danger/15 text-danger border-danger/30'
                                : match.result === '0.5-0.5'
                                ? 'bg-warning/15 text-warning border-warning/30'
                                : 'bg-surface text-fg-muted border-border'
                            }`}
                          >
                            {match.result === 'pending' ? 'Live' : match.result}
                          </span>
                        </div>
                      </div>

                      {/* Rapid Decision Scoring Buttons */}
                      {!isBye && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-border">
                          <span className="text-[10px] font-mono text-fg-subtle uppercase font-bold tracking-wider mr-1">
                            Set:
                          </span>
                          {(['1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F'] as MatchResult[]).map(res => (
                            <button
                              key={res}
                              type="button"
                              disabled={isScoring}
                              onClick={() => handleRecordScore(match.id, res)}
                              className={`px-2.5 py-1 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer ${
                                match.result === res
                                  ? 'bg-accent text-on-accent'
                                  : 'bg-surface text-fg hover:bg-surface-subtle border border-border'
                              }`}
                            >
                              {res === '0.5-0.5' ? '½ - ½' : res}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT DECK: QUICK ARBITER TOOLS & FAST CHECK-IN (5 Columns) */}
        <section className="lg:col-span-5 space-y-5">
          {/* Quick Tool 1: Live Round Countdown Clock */}
          <div className="p-5 rounded-md bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Round Clock Controller</span>
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${
                clockRunning
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-surface-elevated text-fg-muted border-border'
              }`}>
                {clockRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>

            <div className="text-center py-2">
              <span className="font-mono text-4xl sm:text-5xl font-bold text-fg tracking-widest tabular-nums">
                {formatClockTime(clockSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClockRunning(prev => !prev)}
                className={`flex-1 py-2 rounded-sm text-xs font-heading font-semibold transition-colors cursor-pointer ${
                  clockRunning
                    ? 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25'
                    : 'bg-accent text-on-accent hover:bg-accent-hover'
                }`}
              >
                {clockRunning ? 'Pause Clock' : 'Start Round Clock'}
              </button>
              <button
                type="button"
                onClick={() => setClockSeconds(prev => prev + 300)}
                className="px-3 py-2 rounded-sm text-xs font-mono font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                title="Add 5 Minutes"
              >
                +5 Min
              </button>
              <button
                type="button"
                onClick={() => { setClockRunning(false); setClockSeconds(15 * 60); }}
                className="px-3 py-2 rounded-sm text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                title="Reset Clock"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Quick Tool 2: Fast Roster Search & 1-Tap Check-In */}
          <div className="p-5 rounded-md bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
                <span>Fast Desk Check-In</span>
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-accent font-semibold">
                {eventParticipants.filter(p => p.checkInStatus === 'checked_in').length} / {eventParticipants.length} In
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rosterSearch}
                onChange={e => setRosterSearch(e.target.value)}
                placeholder="Search Roll No, Name or Ticket ID..."
                className="w-full pl-9 pr-3 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
              />
            </div>

            {/* Player Search Cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {searchResults.length === 0 ? (
                <p className="text-xs text-fg-subtle text-center py-4 italic">
                  No registered participants match search.
                </p>
              ) : (
                searchResults.map(p => {
                  const isCheckedIn = p.checkInStatus === 'checked_in';
                  const isBusy = checkingInId === p.ticketId;

                  return (
                    <div
                      key={p.ticketId}
                      className="p-2.5 rounded-sm bg-surface-elevated border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-fg truncate">{p.name}</p>
                        <p className="text-[10px] text-fg-muted font-mono">
                          {p.rollNumber} • {p.department}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleFastCheckIn(p)}
                        className={`px-3 py-1.5 rounded-xs text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          isCheckedIn
                            ? 'bg-success/15 text-success border border-success/30'
                            : 'bg-surface hover:bg-accent text-fg hover:text-on-accent border border-border'
                        }`}
                      >
                        {isCheckedIn ? <Check className="w-3 h-3 text-success" /> : <Plus className="w-3 h-3" />}
                        <span>{isCheckedIn ? 'Checked In' : 'Check In'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Tool 3: Standings & Tiebreak Snapshot */}
          <div className="p-5 rounded-md bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <span>Live Standings Snapshot</span>
              </h4>
              <span className="text-[10px] text-fg-subtle font-mono">Auto-recalculated</span>
            </div>

            {standings.length === 0 ? (
              <p className="text-xs text-fg-subtle text-center py-4 italic">
                Standings will compute once Round 1 scores are entered.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {standings.slice(0, 5).map(s => (
                  <div key={s.playerId} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-mono font-bold text-accent tabular-nums">#{s.rank}</span>
                      <span className="font-semibold text-fg truncate max-w-[140px]">{s.playerName}</span>
                    </div>
                    <div className="font-mono text-right tabular-nums">
                      <span className="font-bold text-fg">{s.points} pts</span>
                      <span className="text-[10px] text-fg-subtle ml-2">TB: {s.tieBreaks?.buchholz?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
