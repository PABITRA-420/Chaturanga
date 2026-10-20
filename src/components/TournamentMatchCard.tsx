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
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            1 - 0 (White Won)
          </span>
        );
      case '0-1':
      case '0F-1F':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            0 - 1 (Black Won)
          </span>
        );
      case '0.5-0.5':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            ½ - ½ (Draw)
          </span>
        );
      case '1-0_bye':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            BYE (1 Pt)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Live / In Progress</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-b from-[#12161D]/90 to-[#0B0F14]/90 backdrop-blur-md overflow-hidden shadow-lg transition-all ${className}`}
    >
      {/* Touch-Friendly Card Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? toggleExpand() : null}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors select-none min-h-[64px]"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Board</span>
            <span className="font-mono text-base font-bold text-[#D4AF7C]">
              {match.board_number}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-zinc-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400 shrink-0" title="White" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{match.white_player_name}</span>
              </span>
              <span className="text-zinc-500 text-xs font-normal">vs</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-600 shrink-0" title="Black" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {match.black_player_name || 'BYE'}
                </span>
              </span>
            </div>

            {roundNumber && (
              <p className="text-xs text-zinc-400 font-mono">
                Round {roundNumber} Match
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          {getResultBadge(match.result)}

          <div className="p-1 rounded-lg text-zinc-400 hover:text-white transition">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#D4AF7C]" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Match Drawer */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#070A0E]/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#D4AF7C]" />
              <span>Match Details & Move Archive</span>
            </div>

            {match.pgn && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PGN Broadcast Live
              </span>
            )}
          </div>

          {match.pgn ? (
            <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300 max-h-32 overflow-y-auto leading-relaxed">
              {match.pgn}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              No live moves recorded yet for this board. Moves will appear here when transmitted by arbiters.
            </p>
          )}

          {isArbiter && onResultChange && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Arbiter Decision Quick-Picker
              </p>
              <div className="flex flex-wrap gap-2">
                {(['pending', '1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F'] as MatchResult[]).map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => onResultChange(match.id, res)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer active:scale-95 min-h-[36px] ${
                      match.result === res
                        ? 'bg-[#D4AF7C] text-[#0B0F14]'
                        : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border border-white/10'
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
