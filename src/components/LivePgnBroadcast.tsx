'use client';

import React, { useState } from 'react';
import { PgnViewer } from '@/components/chess/PgnViewer';
import { TournamentGame } from '@/types/pairing';
import { Radio, Users, ChevronRight } from 'lucide-react';

interface LivePgnBroadcastProps {
  games?: TournamentGame[];
  title?: string;
  className?: string;
}

export const LivePgnBroadcast: React.FC<LivePgnBroadcastProps> = ({
  games = [],
  title = 'Live Broadcast & PGN Viewer',
  className = '',
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(games[0]?.id || '');

  const activeGame = games.find(g => g.id === selectedGameId) || games[0];

  return (
    <div className={`space-y-4 ${className}`} data-testid="live-pgn-broadcast">
      {/* Broadcast Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#D4AF7C] border border-[#D4AF7C]/20 flex items-center gap-1.5">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-zinc-400">
              Interactive mobile-first chessboard with touch tap and swipe gesture navigation
            </p>
          </div>
        </div>

        {/* Game Selector Pills */}
        {games.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedGameId === game.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
                }`}
              >
                Board {game.round || 1}: {game.white_player.split(' ')[0]} vs {game.black_player.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Viewer or Empty State */}
      {activeGame ? (
        <PgnViewer
          pgn={activeGame.pgn}
          title={`${activeGame.event_name} • Round ${activeGame.round}`}
        />
      ) : (
        <div
          data-testid="no-live-broadcasts"
          className="p-8 sm:p-12 rounded-2xl bg-[#0B0F15] border border-white/10 text-center flex flex-col items-center justify-center space-y-3 backdrop-blur-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
            <Radio className="w-6 h-6 opacity-70" />
          </div>
          <h4 className="text-base font-bold text-white font-['Montserrat',sans-serif]">
            No Live PGN Broadcasts Active
          </h4>
          <p className="text-xs text-[#A0A6B0] max-w-md font-['Poppins',sans-serif] leading-relaxed">
            Board broadcasts go live when arbiters transmit moves from top tables during tournament rounds. Check back once active rounds begin!
          </p>
        </div>
      )}
    </div>
  );
};

export default LivePgnBroadcast;
