'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { parsePgn, ParsedMove, ParsedPgnGame } from '@/lib/pgnParser';
import { ChessBoard } from './ChessBoard';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trophy,
  Calendar,
  Layers,
} from 'lucide-react';

export interface PgnViewerProps {
  pgn: string;
  initialMoveIndex?: number;
  orientation?: 'white' | 'black';
  title?: string;
  className?: string;
}

export const PgnViewer: React.FC<PgnViewerProps> = ({
  pgn,
  initialMoveIndex = 0,
  orientation: initialOrientation = 'white',
  title,
  className = '',
}) => {
  const game: ParsedPgnGame = useMemo(() => parsePgn(pgn), [pgn]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(() => {
    return Math.min(Math.max(0, initialMoveIndex), game.moves.length);
  });
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(initialOrientation);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1500);

  const moveListRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  const movePairs = useMemo(() => {
    const pairs: { moveNumber: number; white?: ParsedMove; black?: ParsedMove }[] = [];
    for (let i = 0; i < game.moves.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: game.moves[i],
        black: game.moves[i + 1],
      });
    }
    return pairs;
  }, [game.moves]);

  const currentMove = currentMoveIndex > 0 ? game.moves[currentMoveIndex - 1] : null;
  const currentFen = currentMove ? currentMove.fen : game.initialFen;
  const lastMove = currentMove ? { from: currentMove.from, to: currentMove.to } : null;

  useEffect(() => {
    if (!isPlaying) return;

    if (currentMoveIndex >= game.moves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentMoveIndex(prev => {
        if (prev >= game.moves.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, currentMoveIndex, game.moves.length, playSpeed]);

  useEffect(() => {
    if (activeMoveRef.current && moveListRef.current) {
      activeMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentMoveIndex]);

  const handleFirst = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(prev => Math.min(game.moves.length, prev + 1));
  };

  const handleLast = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(game.moves.length);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentMoveIndex >= game.moves.length) {
        setCurrentMoveIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleFlip = () => {
    setBoardOrientation(prev => (prev === 'white' ? 'black' : 'white'));
  };

  const touchStartCoords = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartCoords.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartCoords.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartCoords.current.x;
    const deltaY = touch.clientY - touchStartCoords.current.y;
    touchStartCoords.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      return;
    }

    if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      const target = e.currentTarget.getBoundingClientRect();
      const relativeX = touch.clientX - target.left;
      if (relativeX > target.width / 2) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div
      className={`rounded-md bg-surface border border-border p-4 sm:p-6 ${className}`}
      data-testid="pgn-viewer"
    >
      {/* Game Header Banner */}
      <div className="mb-5 pb-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-accent">
            <Trophy className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{title || game.event}</span>
            {game.round && <span>• Round {game.round}</span>}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-fg">
              {game.white} <span className="text-fg-muted font-normal">vs</span> {game.black}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {game.eco && (
            <span className="px-2.5 py-1 rounded-xs text-[11px] font-mono font-semibold bg-surface-elevated border border-border text-fg-muted">
              ECO: {game.eco}
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-xs text-xs font-mono font-bold border ${
              game.result === '1-0'
                ? 'bg-accent/15 text-accent border-accent/40'
                : game.result === '0-1'
                ? 'bg-info/15 text-info border-info/40'
                : 'bg-success/15 text-success border-success/40'
            }`}
          >
            {game.result}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full flex flex-col items-center select-none touch-pan-y relative"
            data-testid="touch-chessboard-wrapper"
          >
            <ChessBoard
              fen={currentFen}
              orientation={boardOrientation}
              lastMove={lastMove}
            />
            <div className="md:hidden mt-2 text-[11px] text-fg-muted flex items-center justify-center gap-1.5 font-mono">
              <span className="text-accent font-semibold">Touch:</span> Tap left/right or swipe to navigate
            </div>
          </div>

          {/* Playback Controls Toolbar */}
          <div className="w-full max-w-[520px] mt-4 flex items-center justify-between gap-2 bg-surface-elevated p-2.5 rounded-sm border border-border">
            <button
              type="button"
              onClick={handleFirst}
              disabled={currentMoveIndex === 0}
              title="First Move (|<<)"
              aria-label="First Move"
              className="p-2 rounded-xs text-fg-muted hover:text-fg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrev}
              disabled={currentMoveIndex === 0}
              title="Previous Move (<)"
              aria-label="Previous Move"
              className="p-2 rounded-xs text-fg-muted hover:text-fg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause' : 'Auto Play'}
              aria-label={isPlaying ? 'Pause' : 'Auto Play'}
              className="px-4 py-2 rounded-xs font-mono font-bold text-xs flex items-center gap-1.5 bg-accent text-on-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentMoveIndex >= game.moves.length}
              title="Next Move (>)"
              aria-label="Next Move"
              className="p-2 rounded-xs text-fg-muted hover:text-fg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleLast}
              disabled={currentMoveIndex >= game.moves.length}
              title="Last Move (>>|)"
              aria-label="Last Move"
              className="p-2 rounded-xs text-fg-muted hover:text-fg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[1000, 1500, 2500].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaySpeed(s)}
                  className={`px-1.5 py-0.5 rounded-xs text-[10px] font-semibold transition-colors cursor-pointer border ${
                    playSpeed === s
                      ? 'bg-accent/15 text-accent border-accent/40'
                      : 'text-fg-muted hover:text-fg border-transparent'
                  }`}
                >
                  {s / 1000}s
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFlip}
              title="Flip Board Orientation"
              aria-label="Flip Board"
              className="p-2 rounded-xs text-fg-muted hover:text-accent hover:bg-surface transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Interactive Move History List */}
        <div className="lg:col-span-5 flex flex-col h-[420px] bg-surface-elevated rounded-sm border border-border overflow-hidden">
          <div className="p-3 bg-surface border-b border-border flex items-center justify-between text-xs font-mono font-semibold text-fg-muted">
            <span className="flex items-center gap-1.5 text-accent">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Moves List</span>
            </span>
            <span className="text-[11px] tabular-nums">
              Ply: {currentMoveIndex} / {game.moves.length}
            </span>
          </div>

          <div ref={moveListRef} className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
            {movePairs.map(pair => {
              const whitePly = (pair.moveNumber - 1) * 2 + 1;
              const blackPly = (pair.moveNumber - 1) * 2 + 2;

              const isWhiteActive = currentMoveIndex === whitePly;
              const isBlackActive = currentMoveIndex === blackPly;

              return (
                <div
                  key={pair.moveNumber}
                  className="grid grid-cols-12 gap-1 items-center py-0.5 px-2 rounded-xs hover:bg-surface/60"
                >
                  <span className="col-span-2 text-fg-muted font-semibold text-right pr-2 select-none tabular-nums">
                    {pair.moveNumber}.
                  </span>

                  <div className="col-span-5">
                    {pair.white ? (
                      <button
                        type="button"
                        ref={isWhiteActive ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentMoveIndex(whitePly);
                        }}
                        className={`w-full text-left px-2 py-1 rounded-xs transition-colors text-xs font-semibold cursor-pointer ${
                          isWhiteActive
                            ? 'bg-accent text-on-accent font-bold'
                            : 'text-fg hover:bg-surface'
                        }`}
                      >
                        {pair.white.san}
                      </button>
                    ) : null}
                  </div>

                  <div className="col-span-5">
                    {pair.black ? (
                      <button
                        type="button"
                        ref={isBlackActive ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentMoveIndex(blackPly);
                        }}
                        className={`w-full text-left px-2 py-1 rounded-xs transition-colors text-xs font-semibold cursor-pointer ${
                          isBlackActive
                            ? 'bg-accent text-on-accent font-bold'
                            : 'text-fg hover:bg-surface'
                        }`}
                      >
                        {pair.black.san}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-surface border-t border-border flex items-center justify-between text-[11px] font-mono text-fg-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>{game.date}</span>
            </span>
            <span className="font-semibold text-fg">Result: {game.result}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
