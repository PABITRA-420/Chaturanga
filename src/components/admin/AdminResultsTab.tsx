"use client";

import React, { useState, useEffect } from 'react';
import { Tournament, TournamentPodiumItem, TournamentStandingResult } from '@/types/tournament';
import { PodiumCelebration } from '@/components/PodiumCelebration';
import { 
  Trophy, 
  Award, 
  Medal, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  Users, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface Props {
  tournaments: Tournament[];
  onTournamentUpdated?: (updated: Tournament) => void;
}

export default function AdminResultsTab({ tournaments, onTournamentUpdated }: Props) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Form State
  const [summary, setSummary] = useState('');
  const [totalParticipants, setTotalParticipants] = useState(64);
  
  // Podium State
  const [podium, setPodium] = useState<TournamentPodiumItem[]>([
    { rank: '1st (Gold)', name: '', dept: '', score: '', prize: '' },
    { rank: '2nd (Silver)', name: '', dept: '', score: '', prize: '' },
    { rank: '3rd (Bronze)', name: '', dept: '', score: '', prize: '' }
  ]);

  // Standings / Crosstable State
  const [standings, setStandings] = useState<TournamentStandingResult[]>([]);
  
  // UI State
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Set default tournament on load
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      const first = tournaments.find(t => t.status === 'completed') || tournaments[0];
      setSelectedTournamentId(first.id);
    }
  }, [tournaments, selectedTournamentId]);

  // Sync state when tournament selected changes
  useEffect(() => {
    const t = tournaments.find(x => x.id === selectedTournamentId);
    if (t) {
      setSelectedTournament(t);
      setSummary(t.summary || t.description || '');
      setTotalParticipants(t.totalParticipants || t.registeredCount || 64);
      
      if (t.podium && t.podium.length >= 3) {
        setPodium(t.podium);
      } else {
        setPodium([
          { rank: '1st (Gold)', name: '', dept: '', score: '', prize: '' },
          { rank: '2nd (Silver)', name: '', dept: '', score: '', prize: '' },
          { rank: '3rd (Bronze)', name: '', dept: '', score: '', prize: '' }
        ]);
      }

      if (t.results && t.results.length > 0) {
        setStandings(t.results);
      } else {
        setStandings([]);
      }
    }
  }, [selectedTournamentId, tournaments]);

  // Add Row to Swiss Standings
  const handleAddStandingRow = () => {
    const nextRank = standings.length + 1;
    setStandings([
      ...standings,
      {
        rank: nextRank,
        name: '',
        idNumber: '',
        dept: '',
        score: '',
        tieBreak: ''
      }
    ]);
  };

  // Remove Row from Swiss Standings
  const handleRemoveStandingRow = (index: number) => {
    setStandings(standings.filter((_, i) => i !== index).map((row, idx) => ({
      ...row,
      rank: idx + 1
    })));
  };

  // Update specific standing row
  const handleUpdateStanding = (index: number, field: keyof TournamentStandingResult, value: any) => {
    const next = [...standings];
    next[index] = { ...next[index], [field]: value };
    setStandings(next);
  };

  // Pre-fill Standings from Registered Roster
  const handleAutoPopulateFromRoster = async () => {
    if (!selectedTournament) return;
    try {
      const res = await fetch(`/api/registrations?tournament=${encodeURIComponent(selectedTournament.title)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations) && data.registrations.length > 0) {
        const rows: TournamentStandingResult[] = data.registrations.slice(0, 16).map((r: any, idx: number) => ({
          rank: idx + 1,
          name: r.fullName || r.name,
          idNumber: r.rollNumber || '',
          dept: r.department || 'General',
          score: `${Math.max(1, 7 - Math.floor(idx / 2))}.0 / 7.0`,
          tieBreak: `${(32 - idx * 1.5).toFixed(1)}`
        }));
        setStandings(rows);
        setNotice({ type: 'success', text: `Loaded ${rows.length} players from registration roster into standings!` });
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert('No registered participants found for this tournament yet.');
      }
    } catch {
      alert('Failed to fetch participants for this tournament.');
    }
  };

  // Save Standings & Podium
  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;

    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/tournaments/${selectedTournament.id}/results`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          totalParticipants: Number(totalParticipants),
          podium,
          results: standings
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save results');

      setNotice({ 
        type: 'success', 
        text: `Championship results & podium for "${selectedTournament.title}" saved and published to Past Events!` 
      });

      if (onTournamentUpdated && data.tournament) {
        onTournamentUpdated(data.tournament);
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Error saving tournament results.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tournament Selector */}
      <div className="p-6 rounded-md bg-surface border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-accent bg-accent/10 border border-accent/30 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>RESULTS &amp; PODIUM PUBLISHER</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-fg tracking-tight">
            Championship Standings, Prizes &amp; Podiums
          </h2>
          <p className="text-xs text-fg-muted mt-1 max-w-2xl">
            Select any tournament to publish or update final podium medalists, prize disbursement, and Swiss crosstable rankings.
          </p>
        </div>

        {/* Tournament Picker */}
        <div className="w-full md:w-80">
          <label
            htmlFor="results-tournament-select"
            className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-fg-muted mb-1"
          >
            Select Event to Conclude / Edit
          </label>
          <div className="relative">
            <select
              id="results-tournament-select"
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg focus:border-accent appearance-none cursor-pointer pr-10 transition-colors"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id} className="bg-surface text-fg">
                  {t.title} {t.status === 'completed' ? '(Completed)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-fg-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          role="status"
          className={`p-4 rounded-sm border text-xs flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            )}
            <span className="font-semibold">{notice.text}</span>
          </div>
        </div>
      )}

      {selectedTournament && (
        <form onSubmit={handleSaveResults} className="space-y-6">
          {/* 1. TOURNAMENT SUMMARY & TOTAL TURNOUT */}
          <div className="p-6 rounded-md bg-surface border border-border shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-accent" />
              <span>Event Concluding Summary &amp; Attendance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-fg-muted mb-1">Official Summary / Arbiter Report</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter official arbiter summary, round-by-round highlights, and championship deciders..."
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1">Total Turnout / Participants</label>
                <input
                  type="number"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-surface-elevated border border-border text-xs text-fg font-mono tabular-nums focus:border-accent transition-colors"
                />
                <p className="text-[10px] text-fg-muted mt-1.5">
                  Displayed on the Past Events card and archive banner.
                </p>
              </div>
            </div>
          </div>

          {/* 2. PODIUM WINNERS (GOLD, SILVER, BRONZE) */}
          <div className="p-6 rounded-md bg-surface border border-border shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
                  <Medal className="w-4 h-4 text-accent" />
                  <span>Podium Winners &amp; Cash Prizes</span>
                </h3>
                <p className="text-xs text-fg-muted">
                  Displayed with medal graphics on both Past Tournaments and Homepage.
                </p>
              </div>
            </div>

            {podium.some(p => Boolean(p.name?.trim())) && (
              <PodiumCelebration
                winners={podium}
                tournamentTitle={selectedTournament.title}
                autoTrigger={false}
                className="mb-4"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {podium.map((pod, idx) => {
                const isGold = idx === 0;
                const isSilver = idx === 1;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-md border flex flex-col justify-between space-y-4 ${
                      isGold
                        ? 'bg-accent/10 border-accent/40'
                        : isSilver
                        ? 'bg-surface-elevated border-border-strong'
                        : 'bg-warning/10 border-warning/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold ${
                          isGold
                            ? 'bg-accent text-on-accent'
                            : isSilver
                            ? 'bg-primary text-on-primary'
                            : 'bg-warning text-on-warning'
                        }`}
                      >
                        {pod.rank}
                      </span>
                      <Trophy
                        className={`w-4 h-4 ${
                          isGold ? 'text-accent' : isSilver ? 'text-fg-muted' : 'text-warning'
                        }`}
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-fg-muted mb-1">Player Name *</label>
                        <input
                          type="text"
                          required
                          value={pod.name}
                          onChange={(e) => {
                            const next = [...podium];
                            next[idx].name = e.target.value;
                            setPodium(next);
                          }}
                          placeholder={isGold ? 'e.g. Suman Sen' : isSilver ? 'e.g. Rohan Mukherjee' : 'e.g. Aritra Sen'}
                          className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-fg-muted mb-1">Dept</label>
                          <input
                            type="text"
                            value={pod.dept}
                            onChange={(e) => {
                              const next = [...podium];
                              next[idx].dept = e.target.value;
                              setPodium(next);
                            }}
                            placeholder="CSE"
                            className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-fg-muted mb-1">Score</label>
                          <input
                            type="text"
                            value={pod.score}
                            onChange={(e) => {
                              const next = [...podium];
                              next[idx].score = e.target.value;
                              setPodium(next);
                            }}
                            placeholder="6.5 / 7.0"
                            className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-xs text-fg font-mono placeholder:text-fg-subtle focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-fg-muted mb-1">Prize / Trophy Disbursed</label>
                        <input
                          type="text"
                          value={pod.prize}
                          onChange={(e) => {
                            const next = [...podium];
                            next[idx].prize = e.target.value;
                            setPodium(next);
                          }}
                          placeholder={isGold ? '₹10,000 + Gold Trophy' : isSilver ? '₹6,000 + Trophy' : '₹4,000 + Medal'}
                          className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. FULL SWISS CROSSTABLE STANDINGS */}
          <div className="p-6 rounded-md bg-surface border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
                  <Users className="w-4 h-4 text-info" />
                  <span>Full Tournament Crosstable Standings ({standings.length} Players)</span>
                </h3>
                <p className="text-xs text-fg-muted">
                  Public inspection table displayed when visitors click the tournament modal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoPopulateFromRoster}
                  className="px-3 py-1.5 rounded-sm text-xs font-semibold text-info bg-info/10 hover:bg-info/20 border border-info/30 transition-colors cursor-pointer"
                >
                  Auto-fill from Registration Roster
                </button>
                <button
                  type="button"
                  onClick={handleAddStandingRow}
                  className="px-3 py-1.5 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player Row</span>
                </button>
              </div>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full min-w-[700px] text-xs text-left text-fg">
                <thead className="bg-surface-elevated text-fg-muted font-mono text-[10px] uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Rank</th>
                    <th className="py-2.5 px-3">Player Full Name</th>
                    <th className="py-2.5 px-3">Roll / ID Number</th>
                    <th className="py-2.5 px-3 w-28">Department</th>
                    <th className="py-2.5 px-3 w-28">Score</th>
                    <th className="py-2.5 px-3 w-28">TieBreak</th>
                    <th className="py-2.5 px-3 w-12 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-fg-muted">
                        No standings added yet. Click &quot;Add Player Row&quot; or &quot;Auto-fill from Registration Roster&quot;.
                      </td>
                    </tr>
                  ) : (
                    standings.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-elevated/60">
                        <td className="py-2 px-3 font-mono font-bold text-accent tabular-nums">
                          #{row.rank}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleUpdateStanding(idx, 'name', e.target.value)}
                            placeholder="Player Name"
                            className="w-full px-2 py-1 rounded-xs bg-surface-elevated border border-border text-xs text-fg focus:border-accent"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.idNumber}
                            onChange={(e) => handleUpdateStanding(idx, 'idNumber', e.target.value)}
                            placeholder="22101104012"
                            className="w-full px-2 py-1 rounded-xs bg-surface-elevated border border-border text-xs text-fg font-mono focus:border-accent"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.dept}
                            onChange={(e) => handleUpdateStanding(idx, 'dept', e.target.value)}
                            placeholder="CSE"
                            className="w-full px-2 py-1 rounded-xs bg-surface-elevated border border-border text-xs text-fg focus:border-accent"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.score}
                            onChange={(e) => handleUpdateStanding(idx, 'score', e.target.value)}
                            placeholder="6.0 / 7.0"
                            className="w-full px-2 py-1 rounded-xs bg-surface-elevated border border-border text-xs text-fg font-mono focus:border-accent"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.tieBreak}
                            onChange={(e) => handleUpdateStanding(idx, 'tieBreak', e.target.value)}
                            placeholder="28.5"
                            className="w-full px-2 py-1 rounded-xs bg-surface-elevated border border-border text-xs text-fg font-mono focus:border-accent"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveStandingRow(idx)}
                            aria-label={`Remove standing row ${row.rank}`}
                            className="p-1 text-fg-muted hover:text-danger cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Standings...' : 'Save & Publish Standings to Live Site'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
