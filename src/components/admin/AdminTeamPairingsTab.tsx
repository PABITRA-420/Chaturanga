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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Collegiate Team Swiss Arena
            </h2>
            <p className="text-xs text-zinc-400">
              FIDE Olympiad 4-Board Dutch Swiss Pairing Engine, Color Alternation & Standings
            </p>
          </div>
        </div>

        {/* Sub-nav Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('pairings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'pairings'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Pairings & Scoring</span>
          </button>
          <button
            onClick={() => setActiveSubTab('standings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'standings'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Live Standings</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rosters')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'rosters'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teams & Rosters</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Tab: Pairings & Scoring */}
      {activeSubTab === 'pairings' && (
        <div className="space-y-6">
          {/* Round Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            {/* Round Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-400 font-medium mr-1">Rounds:</span>
              {rounds.map(r => (
                <button
                  key={r.round_number}
                  onClick={() => setCurrentRoundNumber(r.round_number)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition ${
                    currentRoundNumber === r.round_number
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                  }`}
                >
                  Round {r.round_number}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateNextRound}
                className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
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
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-lg backdrop-blur-sm"
                >
                  {/* Match Header Banner */}
                  <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                        Table {match.table_number}
                      </span>
                      <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
                        <span className="text-amber-400">{match.white_team_name}</span>
                        <span className="text-zinc-500 font-normal">vs</span>
                        <span className={match.is_bye ? 'text-zinc-500 italic' : 'text-zinc-200'}>
                          {match.black_team_name}
                        </span>
                      </div>
                    </div>

                    {/* Match Result Badge */}
                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="font-mono text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 bg-zinc-950/70 text-zinc-200 border-zinc-700">
                        <span>Score: {match.white_game_points.toFixed(1)} - {match.black_game_points.toFixed(1)}</span>
                        {match.outcome === 'white_win' && (
                          <span className="text-emerald-400">({match.white_team_dept} Win +2 MP)</span>
                        )}
                        {match.outcome === 'black_win' && (
                          <span className="text-emerald-400">({match.black_team_dept} Win +2 MP)</span>
                        )}
                        {match.outcome === 'draw' && (
                          <span className="text-amber-400">(Draw 1-1 MP)</span>
                        )}
                        {match.outcome === 'bye' && (
                          <span className="text-amber-400">(Bye +2 MP)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boards List (if not bye) */}
                  {!match.is_bye && match.boards && match.boards.length > 0 && (
                    <div className="divide-y divide-zinc-800/50">
                      {match.boards.map(board => (
                        <div
                          key={board.board_number}
                          className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/30 hover:bg-zinc-800/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-zinc-500 w-16">
                              Board {board.board_number}
                            </span>
                            <div className="text-xs sm:text-sm">
                              <span className="font-medium text-zinc-200">
                                ⚪ {board.white_player.name}
                              </span>
                              <span className="text-zinc-500 mx-2">vs</span>
                              <span className="font-medium text-zinc-300">
                                ⚫ {board.black_player.name}
                              </span>
                            </div>
                          </div>

                          {/* Quick Score Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {(['pending', '1-0', '0.5-0.5', '0-1'] as MatchResult[]).map(res => (
                              <button
                                key={res}
                                onClick={() => handleScoreChange(match.id, board.board_number, res)}
                                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                                  board.result === res
                                    ? res === '1-0'
                                      ? 'bg-emerald-600 text-white'
                                      : res === '0-1'
                                      ? 'bg-rose-600 text-white'
                                      : res === '0.5-0.5'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-zinc-700 text-white'
                                    : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-700/50'
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
                    <div className="p-4 text-xs text-zinc-400 bg-zinc-950/40 italic">
                      Odd-team round bye allocated to {match.white_team_name}. Automatically awarded 2.0 Match Points and 4.0 Game Points.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-xl">
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
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                    {team.department_code}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    Rating: {team.seed_rating || 1700}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{team.department_name}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Captain: {team.captain_name}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Active Boards (1-4) & Reserves
                  </div>
                  {team.roster.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-zinc-300">
                        {p.is_reserve ? `R${p.board_number - 4}` : `B${p.board_number}`}. {p.name}
                      </span>
                      <span className="font-mono text-zinc-500 text-[11px]">{p.rating}</span>
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
