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
  const [playSpeed, setPlaySpeed] = useState<number>(1500); // 1.5s default

  const moveListRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  // Group moves into pairs (1. e4 e5)
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

  // Current board state and move metadata
  const currentMove = currentMoveIndex > 0 ? game.moves[currentMoveIndex - 1] : null;
  const currentFen = currentMove ? currentMove.fen : game.initialFen;
  const lastMove = currentMove ? { from: currentMove.from, to: currentMove.to } : null;

  // Auto-play interval
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

  // Auto-scroll move list to keep active move in view
  useEffect(() => {
    if (activeMoveRef.current && moveListRef.current) {
      activeMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentMoveIndex]);

  // Navigation handlers
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

  // Touch & Swipe navigation for mobile viewports
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

    // Horizontal swipe threshold: 40px
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> advance move
        handleNext();
      } else {
        // Swiped right -> previous move
        handlePrev();
      }
      return;
    }

    // Tap detection (minimal movement)
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
      className={`rounded-2xl bg-[#0B0F15] border border-amber-500/25 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ${className}`}
      data-testid="pgn-viewer"
    >
      {/* Game Header Banner */}
      <div className="mb-5 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF7C]">
            <Trophy className="w-4 h-4 text-[#D4AF7C]" />
            <span>{title || game.event}</span>
            {game.round && <span>• Round {game.round}</span>}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="font-['Montserrat',sans-serif] font-bold text-lg sm:text-xl text-white">
              {game.white} <span className="text-[#D4AF7C]/70 font-normal">vs</span> {game.black}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {game.eco && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-white/5 border border-white/10 text-[#A0A6B0]">
              ECO: {game.eco}
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              game.result === '1-0'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : game.result === '0-1'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {game.result}
          </span>
        </div>
      </div>

      {/* Main Grid: Board & Move Notation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Chess Board */}
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
            {/* Mobile Touch Navigation Hint */}
            <div className="md:hidden mt-2 text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <span className="text-[#D4AF7C] font-semibold">Touch:</span> Tap left/right or swipe to navigate
            </div>
          </div>

          {/* Playback Controls Toolbar */}
          <div className="w-full max-w-[520px] mt-4 flex items-center justify-between gap-2 bg-[#12161F] p-2.5 rounded-xl border border-white/10">
            {/* Jump Start */}
            <button
              type="button"
              onClick={handleFirst}
              disabled={currentMoveIndex === 0}
              title="First Move (|<<)"
              aria-label="First Move"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Step Back */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentMoveIndex === 0}
              title="Previous Move (<)"
              aria-label="Previous Move"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause' : 'Auto Play'}
              aria-label={isPlaying ? 'Pause' : 'Auto Play'}
              className="px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 bg-[#D4AF7C] text-black hover:bg-[#E5C396] active:scale-95 transition shadow-md shadow-[#D4AF7C]/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Step Forward */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentMoveIndex >= game.moves.length}
              title="Next Move (>)"
              aria-label="Next Move"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Jump End */}
            <button
              type="button"
              onClick={handleLast}
              disabled={currentMoveIndex >= game.moves.length}
              title="Last Move (>>|)"
              aria-label="Last Move"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[1000, 1500, 2500].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaySpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                    playSpeed === s
                      ? 'bg-[#D4AF7C]/20 text-[#D4AF7C] border border-[#D4AF7C]/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s / 1000}s
                </button>
              ))}
            </div>

            {/* Flip Board */}
            <button
              type="button"
              onClick={handleFlip}
              title="Flip Board Orientation"
              aria-label="Flip Board"
              className="p-2 rounded-lg text-slate-300 hover:text-[#D4AF7C] hover:bg-white/10 transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Interactive Move History List */}
        <div className="lg:col-span-5 flex flex-col h-[420px] bg-[#12161F] rounded-xl border border-white/10 overflow-hidden shadow-inner">
          <div className="p-3 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-[#A0A6B0]">
            <span className="flex items-center gap-1.5 text-[#D4AF7C]">
              <Layers className="w-3.5 h-3.5" />
              <span>Moves List</span>
            </span>
            <span className="font-mono text-[11px]">
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
                  className="grid grid-cols-12 gap-1 items-center py-0.5 px-2 rounded hover:bg-white/[0.02]"
                >
                  {/* Move Number */}
                  <span className="col-span-2 text-slate-500 font-semibold text-right pr-2 select-none">
                    {pair.moveNumber}.
                  </span>

                  {/* White Move */}
                  <div className="col-span-5">
                    {pair.white ? (
                      <button
                        type="button"
                        ref={isWhiteActive ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentMoveIndex(whitePly);
                        }}
                        className={`w-full text-left px-2 py-1 rounded transition text-xs font-semibold ${
                          isWhiteActive
                            ? 'bg-[#D4AF7C] text-black font-bold shadow-sm'
                            : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {pair.white.san}
                      </button>
                    ) : null}
                  </div>

                  {/* Black Move */}
                  <div className="col-span-5">
                    {pair.black ? (
                      <button
                        type="button"
                        ref={isBlackActive ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentMoveIndex(blackPly);
                        }}
                        className={`w-full text-left px-2 py-1 rounded transition text-xs font-semibold ${
                          isBlackActive
                            ? 'bg-[#D4AF7C] text-black font-bold shadow-sm'
                            : 'text-slate-200 hover:bg-white/10'
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

          {/* Footer Status */}
          <div className="p-2.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A0A6B0]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>{game.date}</span>
            </span>
            <span className="font-semibold text-white">Result: {game.result}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
