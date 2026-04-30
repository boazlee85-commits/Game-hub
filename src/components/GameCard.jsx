import React from 'react';
import { ExternalLink, Gamepad2, Trash2 } from 'lucide-react';

export default function GameCard({ game, onDelete }) {
  return (
    <article className="group w-full max-w-[334px] overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:border-primary/35">
      <div className="flex h-[140px] items-center justify-center bg-[linear-gradient(135deg,rgba(151,93,245,0.24),rgba(29,72,64,0.55),rgba(22,24,33,0.9))]">
        <Gamepad2 className="h-12 w-12 text-primary/75" />
      </div>

      <div className="space-y-4 bg-card p-[25px]">
        <div className="flex min-h-[28px] items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate text-2xl font-bold leading-tight text-foreground">
            {game.title}
          </h2>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(game)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label={`Delete ${game.title}`}
              title="Delete game"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <a
          href={game.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[14px] bg-primary px-5 text-base font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ExternalLink className="h-5 w-5" />
          Play
        </a>
      </div>
    </article>
  );
}
