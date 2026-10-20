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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10141C] border border-white/10">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Select Active Tournament</span>
          </label>
          <select
            value={selectedTournamentId}
            onChange={e => setSelectedTournamentId(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm font-semibold text-white focus:outline-none focus:border-[#D4AF7C] transition"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePairings}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#D4AF7C] hover:bg-[#E5C396] shadow-md shadow-[#D4AF7C]/20 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Next Round</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
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
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {rounds.map(r => {
              const isActive = r.round_number === activeRoundNumber;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRoundNumber(r.round_number)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#D4AF7C] text-black shadow-md shadow-[#D4AF7C]/20'
                      : 'bg-white/5 text-[#A0A6B0] hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>Round {r.round_number}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                      r.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : r.status === 'draft'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-500/20 text-slate-300'
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
              <div className="md:col-span-7 p-5 rounded-2xl bg-[#12161F] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C]">
                    Round {currentRound.round_number} Controller
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    Total Boards: {currentRound.matches?.length || 0}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#A0A6B0]">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF7C]" />
                    <select
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition shadow-md shadow-emerald-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
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
          <div className="rounded-2xl border border-white/10 bg-[#0E121A] overflow-hidden shadow-xl">
            <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C]">
                Board Pairings & Score Entry
              </span>
              {swapMatch1 && (
                <span className="text-xs text-amber-400 font-semibold animate-pulse">
                  Swap active: select target board
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-[#D4AF7C] font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3 text-center">Board</th>
                    <th className="py-3 px-4">White Player</th>
                    <th className="py-3 px-4 text-center">Result Pill Selector</th>
                    <th className="py-3 px-4">Black Player</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(currentRound?.matches || []).map(m => {
                    const isBye = m.black_player_name === 'BYE' || m.result === '1-0_bye';
                    const isSwappingThis = swapMatch1 === m.id;

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isSwappingThis ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        {/* Board Number */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#D4AF7C]">
                          #{m.board_number}
                        </td>

                        {/* White Player */}
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                            <span>{m.white_player_name}</span>
                          </div>
                        </td>

                        {/* Result Score Pills */}
                        <td className="py-3 px-4 text-center">
                          {isBye ? (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              1.0 BYE
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                              {(['1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F'] as MatchResult[]).map(
                                r => {
                                  const isSelected = m.result === r;
                                  const displayLabel = r === '0.5-0.5' ? '½-½' : r;
                                  return (
                                    <button
                                      key={r}
                                      type="button"
                                      onClick={() => handleRecordScore(m.id, r)}
                                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                                        isSelected
                                          ? 'bg-[#D4AF7C] text-black shadow-sm'
                                          : 'text-slate-300 hover:text-white hover:bg-white/10'
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
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
                            <span className={isBye ? 'text-amber-400/80 font-mono italic' : ''}>
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
                                className={`p-1.5 rounded-lg border transition ${
                                  isSwappingThis
                                    ? 'bg-amber-500 text-black border-amber-400'
                                    : 'text-[#A0A6B0] hover:text-white bg-white/5 border-white/10'
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
                              className="p-1.5 rounded-lg text-[#D4AF7C] hover:text-[#F3E2B8] bg-[#D4AF7C]/10 hover:bg-[#D4AF7C]/20 border border-[#D4AF7C]/30 transition"
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
            <div className="rounded-2xl border border-white/10 bg-[#0E121A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF7C]">
                  <Award className="w-4 h-4" />
                  <span>Collegiate Standings (Top 5 Leaderboard)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-[#A0A6B0] border-b border-white/10">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Player</th>
                      <th className="py-2 px-3 font-mono">Points</th>
                      <th className="py-2 px-3 font-mono">Buchholz Cut 1</th>
                      <th className="py-2 px-3 font-mono">Sonneborn-Berger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.slice(0, 5).map(s => (
                      <tr key={s.playerId}>
                        <td className="py-2 px-3 font-bold text-[#D4AF7C]">#{s.rank}</td>
                        <td className="py-2 px-3 font-semibold text-white">{s.playerName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-300">{s.points}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">
                          {s.tieBreaks.buchholzCut1}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-300">
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
        <div className="p-12 text-center rounded-2xl bg-[#10141C] border border-white/10 space-y-3">
          <Trophy className="w-10 h-10 text-[#D4AF7C]/40 mx-auto" />
          <h3 className="text-base font-bold text-white">No Rounds Generated Yet</h3>
          <p className="text-xs text-[#A0A6B0] max-w-sm mx-auto">
            Ready to start the tournament? Click &quot;Generate Next Round&quot; above to create Round 1 pairings from the registered player list.
          </p>
        </div>
      )}

      {/* PGN Attachment Modal */}
      {editingPgnMatch && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setEditingPgnMatch(null)}
        >
          <div
            className="w-full max-w-lg bg-[#141922] rounded-2xl p-6 border border-[#D4AF7C]/40 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white">
                Attach PGN: Board {editingPgnMatch.board_number} ({editingPgnMatch.white_player_name} vs{' '}
                {editingPgnMatch.black_player_name})
              </h4>
              <button
                type="button"
                onClick={() => setEditingPgnMatch(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={8}
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              placeholder="Paste PGN move notation here (e.g. 1. e4 e5 2. Nf3 Nc6 1-0)..."
              className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#D4AF7C]"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPgnMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePgn}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[#D4AF7C] hover:bg-[#E5C396]"
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
