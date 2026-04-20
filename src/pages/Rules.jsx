import React from 'react';
import { PIECES, PIECE_ORDER, getPieceEmoji } from '@/lib/strategoEngine';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Rules() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-heading font-bold mb-6">How to Play Stratego</h1>
      
      <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
        <Section title="Objective">
          <p>Capture your opponent's <strong>Flag</strong> or eliminate all their movable pieces. Set up your army strategically and outmaneuver your opponent on the battlefield.</p>
        </Section>

        <Section title="Setup">
          <p>Each player places 40 pieces on their side of the 10×10 board (the 4 rows closest to them). Pieces face the player so the opponent cannot see their ranks. The two lakes in the center are impassable.</p>
        </Section>

        <Section title="Movement">
          <ul className="list-disc list-inside space-y-1">
            <li>Players alternate turns, moving one piece per turn.</li>
            <li>Pieces move one square horizontally or vertically (not diagonally).</li>
            <li><strong>Scouts (2)</strong> can move any number of squares in a straight line.</li>
            <li><strong>Bombs</strong> and the <strong>Flag</strong> cannot move.</li>
          </ul>
        </Section>

        <Section title="Combat">
          <p>When a piece moves into an opponent's square, both pieces are revealed. The higher rank wins; the loser is removed.</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>If both pieces have the same rank, both are removed.</li>
            <li>A <strong>Spy (S)</strong> defeats the <strong>Marshal (10)</strong> when attacking.</li>
            <li>A <strong>Miner (3)</strong> can defuse <strong>Bombs</strong>; all other pieces lose to Bombs.</li>
            <li>Any piece capturing the <strong>Flag</strong> wins the game.</li>
          </ul>
        </Section>

        <Section title="Piece Ranks">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {PIECE_ORDER.map(key => (
              <div key={key} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                <span className="text-lg">{getPieceEmoji(key)}</span>
                <div>
                  <p className="font-semibold text-xs">{PIECES[key].name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Rank: {PIECES[key].rank} · ×{PIECES[key].count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-foreground mb-2">{title}</h2>
      {children}
    </div>
  );
}