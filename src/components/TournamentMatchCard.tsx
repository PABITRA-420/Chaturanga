'use client';

import React, { useState } from 'react';
import { TournamentMatch, MatchResult } from '@/types/pairing';
import { ChevronDown, ChevronUp, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface TournamentMatchCardProps {
  match: TournamentMatch;
  roundNumber?: number;
  onResultChange?: (matchId: string, result: MatchResult) => void;
  isArbiter?: boolean;
  className?: string;
}

export const TournamentMatchCard: React.FC<TournamentMatchCardProps> = ({
  match,
  roundNumber,
  onResultChange,
  isArbiter = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(prev => !prev);

  const getResultBadge = (result: MatchResult) => {
    switch (result) {
      case '1-0':
      case '1F-0F':
        return (
          <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-success/10 text-success border border-success/30">
            1 - 0 (White Won)
          </span>
        );
      case '0-1':
      case '0F-1F':
        return (
          <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-danger/10 text-danger border border-danger/30">
            0 - 1 (Black Won)
          </span>
        );
      case '0.5-0.5':
        return (
          <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-warning/10 text-warning border border-warning/30">
            ½ - ½ (Draw)
          </span>
        );
      case '1-0_bye':
        return (
          <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold bg-warning/10 text-warning border border-warning/30">
            BYE (1 Pt)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xs text-xs font-mono font-medium bg-surface-elevated text-fg-muted border border-border flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-warning" aria-hidden="true" />
            <span>Live / In Progress</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-sm border border-border bg-surface overflow-hidden transition-colors hover:border-border-strong ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? (e.preventDefault(), toggleExpand()) : null)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-surface-elevated/60 transition-colors select-none min-h-[64px]"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xs bg-surface-elevated border border-border shrink-0">
            <span className="text-[10px] font-mono uppercase font-semibold text-fg-muted">Board</span>
            <span className="font-mono text-base font-bold text-accent tabular-nums">
              {match.board_number}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-fg font-heading">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-border-strong shrink-0" title="White" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{match.white_player_name}</span>
              </span>
              <span className="text-fg-muted text-xs font-mono font-normal">vs</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] border border-border-strong shrink-0" title="Black" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {match.black_player_name || 'BYE'}
                </span>
              </span>
            </div>

            {roundNumber && (
              <p className="text-xs text-fg-muted font-mono">
                Round {roundNumber} Match
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
          {getResultBadge(match.result)}

          <div className="p-1 text-fg-muted">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-accent" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Match Drawer */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-border bg-surface-elevated space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-fg-muted uppercase tracking-wider">
              <FileText className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Match Details &amp; Move Archive</span>
            </div>

            {match.pgn && (
              <span className="text-[11px] font-mono text-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> PGN Broadcast Live
              </span>
            )}
          </div>

          {match.pgn ? (
            <div className="p-3 rounded-xs bg-bg border border-border font-mono text-xs text-fg max-h-32 overflow-y-auto leading-relaxed">
              {match.pgn}
            </div>
          ) : (
            <p className="text-xs text-fg-muted italic">
              No live moves recorded yet for this board. Moves will appear here when transmitted by arbiters.
            </p>
          )}

          {isArbiter && onResultChange && (
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-mono font-semibold text-fg-muted uppercase tracking-wider">
                Arbiter Decision Quick-Picker
              </p>
              <div className="flex flex-wrap gap-2">
                {(['pending', '1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F'] as MatchResult[]).map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => onResultChange(match.id, res)}
                    className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer min-h-[36px] border ${
                      match.result === res
                        ? 'bg-accent text-on-accent border-accent'
                        : 'bg-surface text-fg-muted hover:text-fg border-border hover:border-border-strong'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentMatchCard;
