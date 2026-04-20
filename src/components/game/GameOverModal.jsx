import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameOverModal({ winner, onNewGame }) {
  const playerWon = winner === 'red';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-md"
    >
      <motion.div
        initial={{ scale: 0.5, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-card border border-border rounded-xl p-8 shadow-2xl text-center max-w-sm"
      >
        <Trophy className={`w-12 h-12 mx-auto mb-4 ${
          playerWon ? 'text-yellow-400' : 'text-blue-400'
        }`} />
        <h2 className="text-2xl font-heading font-bold mb-2">
          {playerWon ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {playerWon 
            ? 'You captured the enemy flag! Well played.' 
            : 'The AI captured your flag. Better luck next time!'}
        </p>
        <Button onClick={onNewGame} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>
      </motion.div>
    </motion.div>
  );
}