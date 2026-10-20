'use client';

import React from 'react';

export interface ChessBoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  onSquareClick?: (square: string) => void;
  className?: string;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/**
 * High-definition SVG Chess Piece Symbols
 */
function ChessPiece({ piece, color }: { piece: string; color: 'w' | 'b' }) {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFF7ED' : '#0B0F15';
  const stroke = isWhite ? '#D4AF7C' : '#94A3B8';
  const secondaryFill = isWhite ? '#D4AF7C' : '#334155';

  const type = piece.toLowerCase();

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" fill={secondaryFill} />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" />
          </g>
        </svg>
      );
    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
            <circle cx="17.5" cy="15.5" r="1.5" fill={stroke} />
          </g>
        </svg>
      );
    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            <path d="M17.5 26h10M22.5 21v10" stroke={secondaryFill} strokeWidth="1.5" />
          </g>
        </svg>
      );
    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-6 15-7-11 2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke={secondaryFill} />
          </g>
        </svg>
      );
    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md select-none">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" stroke={stroke} strokeWidth="1.5" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0V34H11.5v3z" />
            <path d="M11.5 30c5.5-2 15.5-2 21 0m-21 4h21" />
            <path d="M12.5 30c5.5-3 15-3 20 0-1.5-2-1.5-4-1.5-6.5 0-5-4.5-6.5-8.5-6.5s-8.5 1.5-8.5 6.5c0 2.5 0 4.5-1.5 6.5z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Parses FEN piece placement string into an 8x8 matrix
 */
function parseFenToBoard(fen: string): ({ piece: string; color: 'w' | 'b' } | null)[][] {
  const emptyBoard: ({ piece: string; color: 'w' | 'b' } | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  if (!fen) return emptyBoard;

  const placement = fen.split(' ')[0];
  const rows = placement.split('/');

  for (let r = 0; r < 8; r++) {
    if (!rows[r]) continue;
    let fileIdx = 0;
    for (let c = 0; c < rows[r].length; c++) {
      const char = rows[r][c];
      const count = parseInt(char, 10);
      if (!isNaN(count)) {
        fileIdx += count;
      } else {
        if (fileIdx < 8) {
          const isWhite = char === char.toUpperCase();
          emptyBoard[r][fileIdx] = {
            piece: char.toLowerCase(),
            color: isWhite ? 'w' : 'b',
          };
          fileIdx++;
        }
      }
    }
  }

  return emptyBoard;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  orientation = 'white',
  lastMove = null,
  checkSquare = null,
  onSquareClick,
  className = '',
}) => {
  const boardMatrix = parseFenToBoard(fen);

  // Compute displayed ranks & files based on orientation
  const isWhite = orientation === 'white';
  const displayRanks = isWhite ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const displayFiles = isWhite ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div
      className={`relative select-none aspect-square w-full max-w-[520px] mx-auto rounded-xl overflow-hidden border border-amber-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-[#070A0E] p-2 sm:p-3 ${className}`}
      data-testid="chess-board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border border-[#D4AF7C]/20 shadow-inner">
        {displayRanks.map(rIndex =>
          displayFiles.map(fIndex => {
            const squareName = `${FILES[fIndex]}${RANKS[rIndex]}`;
            const isLightSquare = (rIndex + fIndex) % 2 === 0;

            const isLastMoveSource = lastMove?.from === squareName;
            const isLastMoveDest = lastMove?.to === squareName;
            const isCheck = checkSquare === squareName;

            const pieceData = boardMatrix[rIndex][fIndex];

            // Color scheme: Dark gold glassmorphism
            let squareBg = isLightSquare
              ? 'bg-[#222A36]' // Sleek charcoal light square with gold warmth
              : 'bg-[#10141C]'; // Deep midnight obsidian dark square

            if (isLastMoveSource || isLastMoveDest) {
              squareBg = isLightSquare ? 'bg-[#93753E]/60' : 'bg-[#705628]/70';
            }
            if (isCheck) {
              squareBg = 'bg-red-900/60 ring-2 ring-red-500 inset-0';
            }

            // Labels: rank coordinate on leftmost column of board, file coordinate on bottom row
            const showRank = isWhite ? fIndex === 0 : fIndex === 7;
            const showFile = isWhite ? rIndex === 7 : rIndex === 0;

            return (
              <div
                key={squareName}
                data-square={squareName}
                onClick={() => onSquareClick?.(squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBg} hover:opacity-90`}
              >
                {/* Board edge coordinate annotations */}
                {showRank && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-mono font-semibold pointer-events-none ${
                      isLightSquare ? 'text-[#8492A6]' : 'text-[#566375]'
                    }`}
                  >
                    {RANKS[rIndex]}
                  </span>
                )}
                {showFile && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-mono font-semibold pointer-events-none ${
                      isLightSquare ? 'text-[#8492A6]' : 'text-[#566375]'
                    }`}
                  >
                    {FILES[fIndex]}
                  </span>
                )}

                {/* Chess Piece Vector */}
                {pieceData && (
                  <div className="w-[82%] h-[82%] flex items-center justify-center transition-transform transform active:scale-95">
                    <ChessPiece piece={pieceData.piece} color={pieceData.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
