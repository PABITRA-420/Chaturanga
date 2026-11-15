'use client';

import React, { useState, useEffect } from 'react';
import {
  DepartmentTeam,
  TeamRound,
  TeamMatch,
  BoardPairing,
} from '@/types/teamPairing';
import { MatchResult } from '@/types/pairing';
import {
  getTeams,
  saveTeam,
  DEFAULT_JGEC_TEAMS,
} from '@/lib/teamStore';
import {
  generateTeamSwissPairings,
} from '@/lib/teamSwissEngine';
import {
  updateBoardResult,
  calculateTeamStandings,
} from '@/lib/teamScoring';
import { TeamStandingsTable } from '@/components/TeamStandingsTable';
import { Tournament } from '@/types/tournament';
import {
  Shield,
  Users,
  Trophy,
  Swords,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface AdminTeamPairingsTabProps {
  tournaments?: Tournament[];
}

export const AdminTeamPairingsTab: React.FC<AdminTeamPairingsTabProps> = ({
  tournaments = [],
}) => {
  const [selectedTournId, setSelectedTournId] = useState<string>(
    tournaments[0]?.id || 'tourn-jgec-interdept-2026'
  );

  const [activeSubTab, setActiveSubTab] = useState<'pairings' | 'standings' | 'rosters'>('pairings');
  const [teams, setTeams] = useState<DepartmentTeam[]>([]);
  const [rounds, setRounds] = useState<TeamRound[]>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load teams and initial round
  useEffect(() => {
    const loadedTeams = getTeams(selectedTournId);
    setTeams(loadedTeams);

    // If no rounds exist yet, generate Round 1
    if (rounds.length === 0 && loadedTeams.length > 0) {
      const r1Matches = generateTeamSwissPairings(loadedTeams, [], 1);
      const r1: TeamRound = {
        id: `team-round-1`,
        tournament_id: selectedTournId,
        round_number: 1,
        status: 'in_progress',
        matches: r1Matches,
        created_at: new Date().toISOString(),
      };
      setRounds([r1]);
      setCurrentRoundNumber(1);
    }
  }, [selectedTournId]);

  const activeRound = rounds.find(r => r.round_number === currentRoundNumber) || rounds[0];

  const handleGenerateNextRound = () => {
    if (!activeRound) return;

    // Check if current round has incomplete matches
    const hasPendingMatches = activeRound.matches.some(m => !m.is_bye && m.outcome === 'pending');
    if (hasPendingMatches) {
      setFeedbackMessage('Cannot generate next round: Some matches in the current round are still pending.');
      setTimeout(() => setFeedbackMessage(null), 4000);
      return;
    }

    const nextRoundNum = rounds.length + 1;
    const nextMatches = generateTeamSwissPairings(teams, rounds, nextRoundNum);

    const nextRound: TeamRound = {
      id: `team-round-${nextRoundNum}`,
      tournament_id: selectedTournId,
      round_number: nextRoundNum,
      status: 'in_progress',
      matches: nextMatches,
      created_at: new Date().toISOString(),
    };

    setRounds(prev => [...prev, nextRound]);
    setCurrentRoundNumber(nextRoundNum);
    setFeedbackMessage(`Round ${nextRoundNum} pairings generated successfully with rematch prevention!`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleScoreChange = (matchId: string, boardNumber: number, result: MatchResult) => {
    if (!activeRound) return;

    const updatedRound = updateBoardResult(activeRound, matchId, boardNumber, result);
    setRounds(prev => prev.map(r => (r.round_number === updatedRound.round_number ? updatedRound : r)));
  };

  const liveStandings = calculateTeamStandings(teams, rounds);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-md bg-surface border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-accent/10 text-accent border border-accent/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-fg tracking-tight">
              Collegiate Team Swiss Arena
            </h2>
            <p className="text-xs text-fg-muted">
              FIDE Olympiad 4-Board Dutch Swiss Pairing Engine, Color Alternation &amp; Standings
            </p>
          </div>
        </div>

        {/* Sub-nav Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-elevated border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('pairings')}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'pairings'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Pairings &amp; Scoring</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('standings')}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'standings'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Live Standings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('rosters')}
            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rosters'
                ? 'bg-accent text-on-accent'
                : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teams &amp; Rosters</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className="p-3.5 rounded-sm bg-warning/10 border border-warning/30 text-warning text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Tab: Pairings & Scoring */}
      {activeSubTab === 'pairings' && (
        <div className="space-y-6">
          {/* Round Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md bg-surface border border-border">
            {/* Round Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-mono uppercase tracking-wider text-fg-muted font-medium mr-1">Rounds:</span>
              {rounds.map(r => (
                <button
                  type="button"
                  key={r.round_number}
                  onClick={() => setCurrentRoundNumber(r.round_number)}
                  className={`px-3 py-1 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer ${
                    currentRoundNumber === r.round_number
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-elevated text-fg-muted hover:text-fg border border-border'
                  }`}
                >
                  Round {r.round_number}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateNextRound}
                className="px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Round {rounds.length + 1} Pairings</span>
              </button>
            </div>
          </div>

          {/* Matches List */}
          {activeRound && activeRound.matches ? (
            <div className="space-y-4">
              {activeRound.matches.map(match => (
                <div
                  key={match.id}
                  className="rounded-md border border-border bg-surface overflow-hidden shadow-xs"
                >
                  {/* Match Header Banner */}
                  <div className="p-4 bg-surface-elevated border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-xs bg-surface text-fg font-bold border border-border tabular-nums">
                        Table {match.table_number}
                      </span>
                      <div className="flex items-center gap-2 text-sm sm:text-base font-heading font-bold text-fg">
                        <span className="text-accent">{match.white_team_name}</span>
                        <span className="text-fg-subtle font-normal text-xs font-mono">vs</span>
                        <span className={match.is_bye ? 'text-fg-subtle italic' : 'text-fg'}>
                          {match.black_team_name}
                        </span>
                      </div>
                    </div>

                    {/* Match Result Badge */}
                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="font-mono text-xs px-3 py-1 rounded-xs font-semibold border flex items-center gap-1.5 bg-surface text-fg border-border tabular-nums">
                        <span>Score: {match.white_game_points.toFixed(1)} - {match.black_game_points.toFixed(1)}</span>
                        {match.outcome === 'white_win' && (
                          <span className="text-success">({match.white_team_dept} Win +2 MP)</span>
                        )}
                        {match.outcome === 'black_win' && (
                          <span className="text-success">({match.black_team_dept} Win +2 MP)</span>
                        )}
                        {match.outcome === 'draw' && (
                          <span className="text-warning">(Draw 1-1 MP)</span>
                        )}
                        {match.outcome === 'bye' && (
                          <span className="text-warning">(Bye +2 MP)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boards List (if not bye) */}
                  {!match.is_bye && match.boards && match.boards.length > 0 && (
                    <div className="divide-y divide-border">
                      {match.boards.map(board => (
                        <div
                          key={board.board_number}
                          className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface hover:bg-surface-elevated/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-fg-subtle w-16 tabular-nums">
                              Board {board.board_number}
                            </span>
                            <div className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 font-medium text-fg">
                                <span className="w-2.5 h-2.5 rounded-xs bg-white border border-border-strong shrink-0" />
                                {board.white_player.name}
                              </span>
                              <span className="text-fg-subtle font-mono text-xs">vs</span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-fg-muted">
                                <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900 border border-border-strong shrink-0" />
                                {board.black_player.name}
                              </span>
                            </div>
                          </div>

                          {/* Quick Score Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {(['pending', '1-0', '0.5-0.5', '0-1'] as MatchResult[]).map(res => (
                              <button
                                type="button"
                                key={res}
                                onClick={() => handleScoreChange(match.id, board.board_number, res)}
                                className={`px-2.5 py-1 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer ${
                                  board.result === res
                                    ? res === '1-0'
                                      ? 'bg-success text-on-success'
                                      : res === '0-1'
                                      ? 'bg-danger text-on-danger'
                                      : res === '0.5-0.5'
                                      ? 'bg-warning text-on-warning'
                                      : 'bg-primary text-on-primary'
                                    : 'bg-surface-elevated text-fg-muted hover:text-fg border border-border'
                                }`}
                              >
                                {res}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {match.is_bye && (
                    <div className="p-4 text-xs text-fg-muted bg-surface-elevated/60 italic">
                      Odd-team round bye allocated to {match.white_team_name}. Automatically awarded 2.0 Match Points and 4.0 Game Points.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-fg-muted bg-surface border border-border rounded-md">
              No matches found for Round {currentRoundNumber}.
            </div>
          )}
        </div>
      )}

      {/* Tab: Live Standings */}
      {activeSubTab === 'standings' && (
        <TeamStandingsTable
          standings={liveStandings}
          teams={teams}
          title="Collegiate Team Swiss Live Leaderboard"
        />
      )}

      {/* Tab: Teams & Rosters */}
      {activeSubTab === 'rosters' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div
                key={team.id}
                className="p-4 rounded-md border border-border bg-surface space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-xs bg-accent/10 text-accent border border-accent/30 font-bold">
                    {team.department_code}
                  </span>
                  <span className="text-xs text-fg-muted font-mono tabular-nums">
                    Rating: {team.seed_rating || 1700}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-fg text-sm">{team.department_name}</h4>
                  <p className="text-xs text-fg-muted mt-0.5">Captain: {team.captain_name}</p>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-subtle">
                    Active Boards (1-4) &amp; Reserves
                  </div>
                  {team.roster.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-fg">
                        {p.is_reserve ? `R${p.board_number - 4}` : `B${p.board_number}`}. {p.name}
                      </span>
                      <span className="font-mono text-fg-muted text-[11px] tabular-nums">{p.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
