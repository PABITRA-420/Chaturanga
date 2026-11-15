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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-mono font-bold bg-accent/15 text-accent border border-accent/40">
          <Trophy className="w-3 h-3 text-accent" aria-hidden="true" /> 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-mono font-bold bg-surface-elevated text-fg border border-border-strong/50">
          <Award className="w-3 h-3 text-fg-muted" aria-hidden="true" /> 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-mono font-bold bg-warning/10 text-warning border border-warning/30">
          <Award className="w-3 h-3 text-warning" aria-hidden="true" /> 3rd
        </span>
      );
    }
    return <span className="text-fg-muted font-mono text-sm pl-2">#{rank}</span>;
  };

  return (
    <div className={`bg-surface border border-border rounded-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-elevated">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-surface border border-border text-accent">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-fg tracking-tight">{title}</h3>
            <p className="text-xs text-fg-muted font-body">
              Ranked by Match Points (MP: 2-1-0), Game Points (GP), and Sonneborn-Berger (S-B)
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-fg-muted bg-surface px-3 py-1.5 rounded-xs border border-border self-start sm:self-auto">
          {standings.length} Teams Registered
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse" role="table">
          <thead>
            <tr className="border-b border-border text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted bg-surface-elevated/60">
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Department / Team</th>
              <th className="py-3 px-3 text-center w-12" title="Matches Played">P</th>
              <th className="py-3 px-3 text-center w-12 text-success" title="Won">W</th>
              <th className="py-3 px-3 text-center w-12 text-warning" title="Drawn">D</th>
              <th className="py-3 px-3 text-center w-12 text-danger" title="Lost">L</th>
              <th className="py-3 px-4 text-center font-bold text-accent w-16" title="Match Points">MP</th>
              <th className="py-3 px-4 text-center text-fg w-16" title="Total Game Points">GP</th>
              <th className="py-3 px-4 text-center text-fg-muted w-16 hidden md:table-cell" title="Sonneborn-Berger">S-B</th>
              <th className="py-3 px-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-fg-muted text-xs">
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
                      className={`cursor-pointer transition-colors hover:bg-surface-elevated/60 ${
                        isExpanded ? 'bg-surface-elevated/80' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium">
                        {getRankBadge(standing.rank)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs px-2 py-0.5 rounded-xs bg-surface-elevated text-accent font-bold border border-border">
                            {standing.department_code}
                          </span>
                          <div>
                            <div className="font-semibold text-fg hover:text-accent transition-colors">
                              {standing.department_name}
                            </div>
                            <div className="text-xs text-fg-muted font-mono">
                              Capt: {standing.captain_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-fg tabular-nums">{standing.played}</td>
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-success tabular-nums">{standing.won}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-warning tabular-nums">{standing.drawn}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-danger tabular-nums">{standing.lost}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-base text-accent bg-accent/10 tabular-nums">
                        {standing.match_points}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-fg tabular-nums">
                        {standing.game_points.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-fg-muted hidden md:table-cell tabular-nums">
                        {standing.sonneborn_berger.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-fg-muted">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-accent" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Roster Drawer */}
                    {isExpanded && (
                      <tr className="bg-surface-elevated border-b border-border">
                        <td colSpan={10} className="p-4 sm:p-5">
                          <div className="rounded-sm bg-surface border border-border p-4">
                            <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold uppercase tracking-wider text-fg-muted">
                              <Users className="w-4 h-4 text-accent" aria-hidden="true" />
                              <span>{standing.department_name} • Official Board Roster</span>
                            </div>

                            {teamData?.roster && teamData.roster.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                {teamData.roster.map(player => (
                                  <div
                                    key={player.id}
                                    className={`p-2.5 rounded-xs border text-xs flex flex-col justify-between ${
                                      player.is_reserve
                                        ? 'bg-surface-elevated border-border text-fg-muted'
                                        : 'bg-surface border-accent/40 text-fg'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono text-fg-muted">
                                        {player.is_reserve ? `Reserve ${player.board_number - 4}` : `Board ${player.board_number}`}
                                      </span>
                                      <span className="font-mono text-accent font-semibold tabular-nums">
                                        {player.rating || 1500}
                                      </span>
                                    </div>
                                    <div className="font-medium text-fg truncate">
                                      {player.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-fg-muted italic">No roster details registered.</p>
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
