import React from 'react';
import { PIECES } from '@/lib/strategoEngine';

// Stratego piece: rook-style with 3 turrets on top
function StrategoPiece({ player, rank, selected }) {
  const isRed = player === 'red';
  const fill = isRed ? '#c0392b' : '#1a6fbf';
  const highlight = isRed ? '#e74c3c' : '#2980b9';
  const shadow = isRed ? '#922b21' : '#154e8c';
  const textColor = '#fff';

  return (
    <svg
      viewBox="0 0 40 44"
      className={`w-[82%] h-[82%] drop-shadow-lg transition-transform duration-150 ${
        selected ? 'scale-110' : 'hover:scale-105'
      }`}
    >
      {/* Three turret teeth */}
      <rect x="3" y="2" width="8" height="9" rx="1.5" fill={highlight} />
      <rect x="16" y="2" width="8" height="9" rx="1.5" fill={highlight} />
      <rect x="29" y="2" width="8" height="9" rx="1.5" fill={highlight} />

      {/* Body */}
      <rect x="2" y="10" width="36" height="24" rx="3" fill={fill} />

      {/* Highlight stripe */}
      <rect x="2" y="10" width="36" height="4" rx="2" fill={highlight} opacity="0.5" />

      {/* Base */}
      <rect x="0" y="34" width="40" height="8" rx="3" fill={shadow} />

      {/* Rank text */}
      <text
        x="20"
        y="27"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={rank && rank.length > 1 ? "10" : "12"}
        fontWeight="bold"
        fontFamily="sans-serif"
        fill={textColor}
      >
        {rank || '?'}
      </text>
    </svg>
  );
}

export default function BoardCell({
  cell,
  row,
  col,
  isSelected,
  isValidMove,
  isPlayerPiece,
  onClick,
  gamePhase,
  showPiece,
  isSetupZone,
  isSetupTarget
}) {
  // ❌ REMOVED: usePieceImages (was causing crash)

  const isLight = (row + col) % 2 === 0;

  if (cell && cell.type === 'lake') {
    return (
      <div className="aspect-square bg-board-lake/60 flex items-center justify-center relative">
        <span className="text-lg opacity-40">〰️</span>
      </div>
    );
  }

  const bgColor = isSelected
    ? 'bg-yellow-400/40'
    : isValidMove
    ? cell ? 'bg-red-400/30' : 'bg-yellow-300/25'
    : isSetupTarget && !cell
    ? (isLight ? 'bg-board-light brightness-125' : 'bg-board-dark brightness-125')
    : isLight
    ? 'bg-board-light'
    : 'bg-board-dark';

  const piece = cell;
  const canShow = showPiece || (piece && piece.revealed);

  return (
    <div
      onClick={onClick}
      className={`aspect-square ${bgColor} flex items-center justify-center relative cursor-pointer 
        transition-all duration-150 hover:brightness-110 ${
          isValidMove ? 'ring-2 ring-inset ring-yellow-300/50' : 
          isSetupTarget ? 'ring-1 ring-inset ring-white/20' : 
          isSetupZone ? 'ring-1 ring-inset ring-red-400/30' : ''
        }`}
    >
      {piece && (
        <StrategoPiece
          player={piece.player}
          rank={canShow ? PIECES[piece.type]?.rank : null}
          selected={isSelected}
        />
      )}

      {isValidMove && !cell && (
        <div className="w-3 h-3 rounded-full bg-black/25" />
      )}
    </div>
  );
}
