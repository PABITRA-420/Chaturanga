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

const DEFAULT_SAMPLE_GAME: TournamentGame = {
  id: 'game-sample-1',
  tournament_id: 'tourn-jgec-2026',
  white_player: 'Arpan Chakraborty (CSE)',
  black_player: 'Rohan Banerjee (IT)',
  result: '1-0',
  round: 3,
  date: '2026-10-26',
  event_name: 'JGEC Inter-Department Rapid Championship',
  pgn: `[Event "JGEC Inter-Department Rapid Championship"]
[Site "Jalpaiguri, WB"]
[Date "2026.10.26"]
[Round "3"]
[White "Arpan Chakraborty"]
[Black "Rohan Banerjee"]
[Result "1-0"]
[ECO "C50"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 a6 7. Bb3 Ba7 8. Nbd2 O-O 9. h3 h6 10. Re1 Re8 11. Nf1 Be6 12. Bc2 d5 13. Qe2 Qd7 14. Ng3 Rad8 15. Nh4 dxe4 16. dxe4 Ne7 17. Qf3 Nh7 18. Nhf5 Ng6 19. Qh5 Bc4 20. b3 Bd3 21. Rd1 Bxc2 22. Rxd7 Rxd7 23. Bxh6 gxh6 24. Qxh6 f6 25. Qxg6+ Kf8 26. Qh6+ Kg8 27. Nh5 Rf8 28. Qg6+ Kh8 29. Nh6 Bc5 30. Re1 b5 31. Re2 Bd3 32. Rd2 a5 33. Rxd3 1-0`,
};

export const LivePgnBroadcast: React.FC<LivePgnBroadcastProps> = ({
  games = [DEFAULT_SAMPLE_GAME],
  title = 'Live Broadcast & PGN Viewer',
  className = '',
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(games[0]?.id || DEFAULT_SAMPLE_GAME.id);

  const activeGame = games.find(g => g.id === selectedGameId) || games[0] || DEFAULT_SAMPLE_GAME;

  return (
    <div className={`space-y-4 ${className}`} data-testid="live-pgn-broadcast">
      {/* Broadcast Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
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

      {/* Main PGN Viewer */}
      <PgnViewer
        pgn={activeGame.pgn}
        title={`${activeGame.event_name} • Round ${activeGame.round}`}
      />
    </div>
  );
};

export default LivePgnBroadcast;
