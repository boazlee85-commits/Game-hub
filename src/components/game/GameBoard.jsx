import React from 'react';
import BoardCell from './BoardCell';

export default function GameBoard({ 
  board, selectedCell, validMoves, currentPlayer, 
  onCellClick, gamePhase, setupHighlightZone, selectedPieceType
}) {
  const isValidMove = (r, c) => validMoves.some(([vr, vc]) => vr === r && vc === c);

  return (
    <div className="relative">
      {/* Column labels */}
      <div className="flex mb-1 pl-6">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col mr-1 justify-around">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex-1 flex items-center text-[10px] text-muted-foreground font-medium w-4 justify-center">
              {10 - i}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div className="grid grid-cols-10 flex-1 rounded-md overflow-hidden shadow-2xl border border-border/50">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <BoardCell
                key={`${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                isSelected={selectedCell && selectedCell[0] === r && selectedCell[1] === c}
                isValidMove={isValidMove(r, c)}
                isPlayerPiece={cell && cell.player === 'red'}
                showPiece={cell && (cell.player === 'red' || cell.revealed)}
                onClick={() => onCellClick(r, c)}
                gamePhase={gamePhase}
                isSetupZone={setupHighlightZone && r >= 6}
                isSetupTarget={setupHighlightZone && selectedPieceType && r >= 6 && !(cell && cell.type === 'lake')}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}