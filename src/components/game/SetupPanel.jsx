import React from 'react';
import { Button } from '@/components/ui/button';
import { PIECES, PIECE_ORDER, getPieceEmoji } from '@/lib/strategoEngine';
import { Shuffle, Play } from 'lucide-react';

export default function SetupPanel({ piecesLeft, onAutoSetup, onStartGame, canStart }) {
  const totalLeft = Object.values(piecesLeft).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Setup Your Army</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Place your pieces on the bottom 4 rows, or auto-setup.
      </p>

      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {PIECE_ORDER.map(key => (
          <div key={key} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded ${
            piecesLeft[key] > 0 ? 'bg-muted' : 'bg-muted/30 opacity-40'
          }`}>
            <span>{getPieceEmoji(key)}</span>
            <span className="text-muted-foreground truncate">{PIECES[key].rank}</span>
            <span className="ml-auto font-bold text-foreground">{piecesLeft[key]}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={onAutoSetup} variant="secondary" size="sm" className="flex-1 gap-1.5">
          <Shuffle className="w-3.5 h-3.5" />
          Auto
        </Button>
        <Button 
          onClick={onStartGame} 
          disabled={!canStart} 
          size="sm" 
          className="flex-1 gap-1.5 bg-primary hover:bg-primary/90"
        >
          <Play className="w-3.5 h-3.5" />
          Play
        </Button>
      </div>

      {totalLeft > 0 && (
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {totalLeft} pieces remaining to place
        </p>
      )}
    </div>
  );
}