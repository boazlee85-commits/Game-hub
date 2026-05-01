import React, { useEffect, useState } from 'react';
import { gameStorage } from '@/lib/gameStorage';
import { realtime } from '@/lib/realtime';
import GameCard from '../components/GameCard';
import { Input } from '@/components/ui/input';
import { Gamepad2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    realtime.initRealtime();
    setGames(gameStorage.getGamesSorted('-created_date'));
    setIsLoading(false);

    const unsubscribe = realtime.onGameAdded((game) => {
      setGames((prevGames) => {
        if (prevGames.some((item) => item.id === game.id)) {
          return prevGames;
        }

        const nextGames = [game, ...prevGames];
        return nextGames.sort((a, b) => (a.created_date < b.created_date ? 1 : -1));
      });
      gameStorage.saveGame(game);
    });

    return unsubscribe;
  }, []);

  const handleDelete = (game) => {
    const shouldDelete = window.confirm(`Delete "${game.title}" from GameHub?`);
    if (!shouldDelete) return;

    try {
      gameStorage.deleteGame(game.id);
      setGames(prev => prev.filter(item => item.id !== game.id));
      toast({ title: 'Game deleted' });
    } catch (error) {
      toast({
        title: 'Could not delete game',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filtered = games.filter(game =>
    game.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-heading text-[44px] font-bold leading-tight tracking-normal text-foreground md:text-5xl">
          Discover Games
        </h1>
        <p className="text-xl font-medium text-muted-foreground">
          Search and play games uploaded by the community
        </p>
      </header>

      <div className="relative max-w-[720px]">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-[60px] rounded-[18px] border-border bg-card pl-[60px] text-lg text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-muted-foreground">Loading games...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex max-w-[420px] flex-col items-center justify-center rounded-[18px] border border-border bg-card px-8 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {search ? 'No games match your search' : 'No games uploaded yet'}
          </h2>
          {!search && (
            <p className="mt-2 text-sm text-muted-foreground">
              Add one from Upload Games and it will stay here until you delete it.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),334px))]">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
