import React from 'react';
import { Clock, Trophy } from 'lucide-react';

export default function PlayerBar({ name, color, isActive, captures = [], avatar }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-primary/15 ring-1 ring-primary/40' : 'bg-card'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
        color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
      }`}>
        {avatar || (color === 'red' ? '🔴' : '🔵')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{name}</span>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {captures.slice(0, 8).map((cap, i) => (
            <span key={i} className="text-xs opacity-70">{cap}</span>
          ))}
          {captures.length > 8 && (
            <span className="text-xs text-muted-foreground">+{captures.length - 8}</span>
          )}
        </div>
      </div>
    </div>
  );
}