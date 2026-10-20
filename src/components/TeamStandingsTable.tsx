'use client';

import React, { useState } from 'react';
import { TeamStanding, DepartmentTeam } from '@/types/teamPairing';
import { Users, ChevronDown, ChevronUp, Trophy, Award, Shield } from 'lucide-react';

interface TeamStandingsTableProps {
  standings: TeamStanding[];
  teams?: DepartmentTeam[];
  title?: string;
  className?: string;
}

export const TeamStandingsTable: React.FC<TeamStandingsTableProps> = ({
  standings,
  teams = [],
  title = 'Inter-Department Collegiate Team Standings',
  className = '',
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Trophy className="w-3 h-3 text-amber-400" /> 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-300/20 text-slate-200 border border-slate-300/30">
          <Award className="w-3 h-3 text-slate-300" /> 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-700/20 text-amber-400 border border-amber-700/30">
          <Award className="w-3 h-3 text-amber-600" /> 3rd
        </span>
      );
    }
    return <span className="text-zinc-400 font-mono text-sm pl-2">#{rank}</span>;
  };

  return (
    <div className={`bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-zinc-400">
              Ranked by Match Points (MP: 2-1-0), Game Points (GP), and Sonneborn-Berger (S-B)
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500 bg-zinc-800/60 px-3 py-1.5 rounded-md border border-zinc-700/50 self-start sm:self-auto">
          {standings.length} Teams Registered
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse" role="table">
          <thead>
            <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-950/40">
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Department / Team</th>
              <th className="py-3 px-3 text-center w-12" title="Matches Played">P</th>
              <th className="py-3 px-3 text-center w-12 text-emerald-400" title="Won">W</th>
              <th className="py-3 px-3 text-center w-12 text-amber-400" title="Drawn">D</th>
              <th className="py-3 px-3 text-center w-12 text-rose-400" title="Lost">L</th>
              <th className="py-3 px-4 text-center font-bold text-amber-300 w-16" title="Match Points">MP</th>
              <th className="py-3 px-4 text-center text-zinc-300 w-16" title="Total Game Points">GP</th>
              <th className="py-3 px-4 text-center text-zinc-400 w-16 hidden md:table-cell" title="Sonneborn-Berger">S-B</th>
              <th className="py-3 px-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-zinc-500">
                  No team standings available yet. Start rounds to generate live standings.
                </td>
              </tr>
            ) : (
              standings.map(standing => {
                const isExpanded = expandedTeamId === standing.team_id;
                const teamData = teams.find(t => t.id === standing.team_id);

                return (
                  <React.Fragment key={standing.team_id}>
                    <tr
                      onClick={() => toggleExpand(standing.team_id)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-800/40 ${
                        isExpanded ? 'bg-zinc-800/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium">
                        {getRankBadge(standing.rank)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700/60">
                            {standing.department_code}
                          </span>
                          <div>
                            <div className="font-semibold text-zinc-100 hover:text-amber-300 transition-colors">
                              {standing.department_name}
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-1">
                              <span>Capt: {standing.captain_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-zinc-300">{standing.played}</td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-emerald-400">{standing.won}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-amber-400">{standing.drawn}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-400">{standing.lost}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-base text-amber-300 bg-amber-500/5">
                        {standing.match_points}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-200">
                        {standing.game_points.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-400 hidden md:table-cell">
                        {standing.sonneborn_berger.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-zinc-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 hover:text-zinc-200" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Roster Drawer */}
                    {isExpanded && (
                      <tr className="bg-zinc-950/60 border-b border-zinc-800">
                        <td colSpan={10} className="p-4 sm:p-5">
                          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              <Users className="w-4 h-4 text-amber-400" />
                              <span>{standing.department_name} • Official Board Roster</span>
                            </div>

                            {teamData?.roster && teamData.roster.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                {teamData.roster.map(player => (
                                  <div
                                    key={player.id}
                                    className={`p-2.5 rounded-md border text-xs flex flex-col justify-between ${
                                      player.is_reserve
                                        ? 'bg-zinc-800/40 border-zinc-700/40 text-zinc-400'
                                        : 'bg-zinc-800/80 border-amber-500/20 text-zinc-200 shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono text-zinc-400">
                                        {player.is_reserve ? `Reserve ${player.board_number - 4}` : `Board ${player.board_number}`}
                                      </span>
                                      <span className="font-mono text-amber-400/90 font-medium">
                                        {player.rating || 1500}
                                      </span>
                                    </div>
                                    <div className="font-medium text-zinc-100 truncate">
                                      {player.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500 italic">No roster details registered.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
