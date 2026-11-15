'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tournament } from '@/types/tournament';
import {
  MatchResult,
  PlayerStanding,
  RoundStatus,
  TournamentMatch,
  TournamentRound,
} from '@/types/pairing';
import { RoundCountdownClock } from '@/components/chess/RoundCountdownClock';
import {
  Trophy,
  Play,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  ArrowLeftRight,
  FileText,
  AlertCircle,
  Eye,
  Award,
} from 'lucide-react';

interface AdminPairingsTabProps {
  tournaments: Tournament[];
}

export default function AdminPairingsTab({ tournaments }: AdminPairingsTabProps) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(() => {
    return tournaments[0]?.id || '';
  });

  const [rounds, setRounds] = useState<TournamentRound[]>([]);
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Duration for round publishing
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  // Manual board swap state
  const [swapMatch1, setSwapMatch1] = useState<string | null>(null);

  // PGN modal state
  const [editingPgnMatch, setEditingPgnMatch] = useState<TournamentMatch | null>(null);
  const [pgnInput, setPgnInput] = useState<string>('');

  const loadPairings = useCallback(async (tournId: string) => {
    if (!tournId) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/tournaments/${tournId}/pairings`);
      const data = await res.json();
      if (data.success) {
        setRounds(data.rounds || []);
        setStandings(data.standings || []);
        if (data.rounds && data.rounds.length > 0) {
          // Default to latest round
          setActiveRoundNumber(data.rounds[data.rounds.length - 1].round_number);
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to load pairings' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error fetching pairings' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      loadPairings(selectedTournamentId);
    }
  }, [selectedTournamentId, loadPairings]);

  // Current active round object
  const currentRound = rounds.find(r => r.round_number === activeRoundNumber);

  // Generate Next Round Pairings
  const handleGeneratePairings = async () => {
    if (!selectedTournamentId) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const nextRoundNum = rounds.length + 1;
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_pairings',
          roundNumber: nextRoundNum,
          durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        await loadPairings(selectedTournamentId);
        setActiveRoundNumber(nextRoundNum);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Pairing generation failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error communicating with server' });
    } finally {
      setSubmitting(false);
    }
  };

  // Publish Round
  const handlePublishRound = async (roundId: string) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_round',
          roundId,
          durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        await loadPairings(selectedTournamentId);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to publish round' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error publishing round' });
    } finally {
      setSubmitting(false);
    }
  };

  // Record Match Score
  const handleRecordScore = async (matchId: string, result: MatchResult) => {
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          result,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic UI update
        setRounds(prev =>
          prev.map(r => ({
            ...r,
            matches: (r.matches || []).map(m => (m.id === matchId ? { ...m, result } : m)),
          }))
        );
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to record score' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Score update failed' });
    }
  };

  // Swap Players between two boards
  const handleSwapClick = async (matchId: string) => {
    if (!swapMatch1) {
      setSwapMatch1(matchId);
      setFeedback({
        type: 'success',
        message: 'Board selected! Now click "Swap" on another board to swap white players.',
      });
      return;
    }

    if (swapMatch1 === matchId) {
      setSwapMatch1(null);
      setFeedback(null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'swap_players',
          matchId1: swapMatch1,
          matchId2: matchId,
          swapWhite: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'White players successfully swapped.' });
        await loadPairings(selectedTournamentId);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Swap failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSwapMatch1(null);
      setSubmitting(false);
    }
  };

  // Save PGN to Match
  const handleSavePgn = async () => {
    if (!editingPgnMatch) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: editingPgnMatch.id,
          result: editingPgnMatch.result,
          pgn: pgnInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'PGN match record saved.' });
        setEditingPgnMatch(null);
        await loadPairings(selectedTournamentId);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-pairings-tab">
      {/* Top Controls: Tournament Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-md bg-surface border border-border">
        <div className="space-y-1">
          <label
            htmlFor="pairings-tournament-select"
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Select Active Tournament</span>
          </label>
          <select
            id="pairings-tournament-select"
            value={selectedTournamentId}
            onChange={e => setSelectedTournamentId(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-sm font-semibold text-fg focus:border-accent transition-colors"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id} className="bg-surface text-fg">
                {t.title} ({t.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadPairings(selectedTournamentId)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePairings}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Next Round</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-sm border flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Round Tabs Navigation */}
      {rounds.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
            {rounds.map(r => {
              const isActive = r.round_number === activeRoundNumber;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRoundNumber(r.round_number)}
                  className={`px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-accent text-on-accent'
                      : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-subtle border border-border'
                  }`}
                >
                  <span>Round {r.round_number}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-xs text-[10px] uppercase font-mono ${
                      r.status === 'published'
                        ? isActive
                          ? 'bg-black/15 text-on-accent'
                          : 'bg-success/15 text-success'
                        : r.status === 'draft'
                        ? isActive
                          ? 'bg-black/15 text-on-accent'
                          : 'bg-warning/15 text-warning'
                        : 'bg-surface-elevated text-fg-muted'
                    }`}
                  >
                    {r.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Round Controls Header */}
          {currentRound && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 p-5 rounded-md bg-surface border border-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                    Round {currentRound.round_number} Controller
                  </div>
                  <div className="text-sm font-semibold text-fg mt-0.5 font-mono tabular-nums">
                    Total Boards: {currentRound.matches?.length || 0}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <select
                      aria-label="Round duration in minutes"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-sm bg-surface-elevated border border-border text-xs text-fg font-mono"
                    >
                      <option value={15}>15 Mins</option>
                      <option value={25}>25 Mins</option>
                      <option value={60}>60 Mins</option>
                      <option value={90}>90 Mins</option>
                    </select>
                  </div>

                  {currentRound.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handlePublishRound(currentRound.id)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-success bg-success hover:bg-success/90 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Publish Round</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-5">
                <RoundCountdownClock
                  startTime={currentRound.start_time}
                  durationMinutes={currentRound.duration_minutes || durationMinutes}
                  status={currentRound.status}
                />
              </div>
            </div>
          )}

          {/* Matches Pairings Table */}
          <div className="rounded-md border border-border bg-surface overflow-hidden shadow-xs">
            <div className="p-4 bg-surface-elevated border-b border-border flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Board Pairings &amp; Score Entry
              </span>
              {swapMatch1 && (
                <span className="text-xs font-mono text-warning font-semibold">
                  Swap active: select target board
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-[10px] font-mono uppercase tracking-wider text-fg-muted font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-3 text-center">Board</th>
                    <th className="py-3 px-4">White Player</th>
                    <th className="py-3 px-4 text-center">Result Pill Selector</th>
                    <th className="py-3 px-4">Black Player</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(currentRound?.matches || []).map(m => {
                    const isBye = m.black_player_name === 'BYE' || m.result === '1-0_bye';
                    const isSwappingThis = swapMatch1 === m.id;

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-surface-elevated/60 transition-colors ${
                          isSwappingThis ? 'bg-warning/10' : ''
                        }`}
                      >
                        {/* Board Number */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-accent tabular-nums">
                          #{m.board_number}
                        </td>

                        {/* White Player */}
                        <td className="py-3 px-4 font-semibold text-fg">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-xs bg-white border border-border-strong shrink-0" />
                            <span>{m.white_player_name}</span>
                          </div>
                        </td>

                        {/* Result Score Pills */}
                        <td className="py-3 px-4 text-center">
                          {isBye ? (
                            <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-warning/15 text-warning border border-warning/30">
                              1.0 BYE
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-surface-elevated p-1 rounded-sm border border-border">
                              {(['1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F'] as MatchResult[]).map(
                                r => {
                                  const isSelected = m.result === r;
                                  const displayLabel = r === '0.5-0.5' ? '½-½' : r;
                                  return (
                                    <button
                                      key={r}
                                      type="button"
                                      onClick={() => handleRecordScore(m.id, r)}
                                      className={`px-2 py-0.5 rounded-xs text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'bg-accent text-on-accent'
                                          : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                                      }`}
                                    >
                                      {displayLabel}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </td>

                        {/* Black Player */}
                        <td className="py-3 px-4 font-semibold text-fg">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900 border border-border-strong shrink-0" />
                            <span className={isBye ? 'text-warning font-mono italic' : ''}>
                              {m.black_player_name || 'BYE'}
                            </span>
                          </div>
                        </td>

                        {/* Actions: Swap & PGN */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isBye && (
                              <button
                                type="button"
                                onClick={() => handleSwapClick(m.id)}
                                title="Swap White Player with another board"
                                aria-label="Swap White Player with another board"
                                className={`p-1.5 rounded-sm border transition-colors cursor-pointer ${
                                  isSwappingThis
                                    ? 'bg-warning text-on-accent border-warning'
                                    : 'text-fg-muted hover:text-fg bg-surface-elevated border-border'
                                }`}
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPgnMatch(m);
                                setPgnInput(m.pgn || '');
                              }}
                              title="Attach PGN Match Record"
                              aria-label="Attach PGN Match Record"
                              className="p-1.5 rounded-sm text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Standings Preview */}
          {standings.length > 0 && (
            <div className="rounded-md border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent">
                  <Award className="w-4 h-4" />
                  <span>Collegiate Standings (Top 5 Leaderboard)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated text-[10px] font-mono uppercase tracking-wider text-fg-muted border-b border-border">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Player</th>
                      <th className="py-2 px-3 font-mono">Points</th>
                      <th className="py-2 px-3 font-mono">Buchholz Cut 1</th>
                      <th className="py-2 px-3 font-mono">Sonneborn-Berger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standings.slice(0, 5).map(s => (
                      <tr key={s.playerId}>
                        <td className="py-2 px-3 font-mono font-bold text-accent tabular-nums">#{s.rank}</td>
                        <td className="py-2 px-3 font-semibold text-fg">{s.playerName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-accent tabular-nums">{s.points}</td>
                        <td className="py-2 px-3 font-mono text-fg-muted tabular-nums">
                          {s.tieBreaks.buchholzCut1}
                        </td>
                        <td className="py-2 px-3 font-mono text-fg-muted tabular-nums">
                          {s.tieBreaks.sonnebornBerger}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-md bg-surface border border-border space-y-3">
          <Trophy className="w-9 h-9 text-accent/50 mx-auto" />
          <h3 className="font-heading text-base font-bold text-fg">No Rounds Generated Yet</h3>
          <p className="text-xs text-fg-muted max-w-sm mx-auto">
            Ready to start the tournament? Click &quot;Generate Next Round&quot; above to create Round 1 pairings from the registered player list.
          </p>
        </div>
      )}

      {/* PGN Attachment Modal */}
      {editingPgnMatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Attach PGN"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs p-4 flex items-center justify-center"
          onClick={() => setEditingPgnMatch(null)}
        >
          <div
            className="w-full max-w-lg bg-surface rounded-md p-6 border border-border-strong space-y-4 shadow-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-heading text-sm font-bold text-fg">
                Attach PGN: Board {editingPgnMatch.board_number} ({editingPgnMatch.white_player_name} vs{' '}
                {editingPgnMatch.black_player_name})
              </h4>
              <button
                type="button"
                aria-label="Close PGN Modal"
                onClick={() => setEditingPgnMatch(null)}
                className="p-1 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={8}
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              placeholder="Paste PGN move notation here (e.g. 1. e4 e5 2. Nf3 Nc6 1-0)..."
              className="w-full p-3 rounded-sm bg-surface-elevated border border-border text-xs font-mono text-fg placeholder:text-fg-subtle focus:border-accent"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPgnMatch(null)}
                className="px-4 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePgn}
                className="px-5 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover cursor-pointer"
              >
                Save PGN Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
