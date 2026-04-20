import React, { useEffect, useState } from 'react';
import { getPieceEmoji, PIECES } from '@/lib/strategoEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';

export default function BattleModal({ battle, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (battle) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [battle]);

  if (!battle) return null;

  const { attacker, defender, result } = battle;
  const attackerWon = result === 'attacker';
  const defenderWon = result === 'defender';
  const tie = result === 'both';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-md"
        >
          <motion.div
            initial={{ scale: 0.5, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-2xl text-center max-w-xs"
          >
            <Swords className="w-6 h-6 text-accent mx-auto mb-3" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Battle!</p>
            
            <div className="flex items-center justify-center gap-4">
              <PieceCard piece={attacker} won={attackerWon} lost={defenderWon} />
              <span className="text-2xl font-bold text-muted-foreground">⚡</span>
              <PieceCard piece={defender} won={defenderWon} lost={attackerWon} />
            </div>

            <p className="mt-4 text-sm font-semibold">
              {tie ? '💀 Both destroyed!' : attackerWon ? '⚔️ Attacker wins!' : '🛡️ Defender wins!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PieceCard({ piece, won, lost }) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
      won ? 'border-primary bg-primary/10' : lost ? 'border-destructive/50 bg-destructive/10 opacity-50' : 'border-border'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
        piece.player === 'red' ? 'bg-red-500/20' : 'bg-blue-500/20'
      }`}>
        {getPieceEmoji(piece.type)}
      </div>
      <span className="text-xs font-bold mt-1">{PIECES[piece.type]?.name}</span>
      <span className="text-[10px] text-muted-foreground">Rank: {PIECES[piece.type]?.rank}</span>
    </div>
  );
}