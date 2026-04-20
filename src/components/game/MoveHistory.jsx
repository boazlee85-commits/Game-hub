import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPieceEmoji } from '@/lib/strategoEngine';

export default function MoveHistory({ moves }) {
  if (moves.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No moves yet
      </div>
    );
  }

  const toNotation = (r, c) => `${String.fromCharCode(65 + c)}${10 - r}`;

  return (
    <ScrollArea className="h-48">
      <div className="space-y-1 p-2">
        {moves.map((move, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
            i % 2 === 0 ? 'bg-muted/50' : ''
          }`}>
            <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
            <span className={move.player === 'red' ? 'text-red-400' : 'text-blue-400'}>
              {move.revealed ? getPieceEmoji(move.pieceType) : '?'}
            </span>
            <span className="text-foreground font-mono">
              {toNotation(move.from[0], move.from[1])} → {toNotation(move.to[0], move.to[1])}
            </span>
            {move.capture && (
              <span className="text-accent text-[10px]">⚔️</span>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}