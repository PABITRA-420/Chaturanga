'use client';

import React, { useState } from 'react';
import { PgnViewer } from '@/components/chess/PgnViewer';
import { TournamentGame } from '@/types/pairing';
import { Radio } from 'lucide-react';

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
      <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-accent/10 text-accent border border-accent/30 flex items-center gap-1.5">
            <Radio className="w-4 h-4" aria-hidden="true" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">LIVE</span>
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-fg tracking-tight">{title}</h3>
            <p className="text-xs text-fg-muted font-body">
              Interactive mobile-first chessboard with touch tap and swipe gesture navigation
            </p>
          </div>
        </div>

        {games.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {games.map(game => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGameId(game.id)}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedGameId === game.id
                    ? 'bg-accent text-on-accent border-accent font-bold'
                    : 'bg-surface-elevated text-fg-muted hover:text-fg border-border'
                }`}
              >
                Board {game.round || 1}: {game.white_player.split(' ')[0]} vs {game.black_player.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeGame ? (
        <PgnViewer
          pgn={activeGame.pgn}
          title={`${activeGame.event_name} • Round ${activeGame.round}`}
        />
      ) : (
        <div
          data-testid="no-live-broadcasts"
          className="p-8 sm:p-12 rounded-md bg-surface border border-border text-center flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-12 h-12 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent">
            <Radio className="w-6 h-6 opacity-70" aria-hidden="true" />
          </div>
          <h4 className="text-base font-bold text-fg font-heading">
            No Live PGN Broadcasts Active
          </h4>
          <p className="text-xs text-fg-muted max-w-md font-body leading-relaxed">
            Board broadcasts go live when arbiters transmit moves from top tables during tournament rounds.
          </p>
        </div>
      )}
    </div>
  );
};

export default LivePgnBroadcast;
