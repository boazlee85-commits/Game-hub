import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  createGame,
  getAvailableGames,
  getPlayerGames,
  joinGame,
} from '@/lib/firestoreGameService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableGames, setAvailableGames] = useState([]);
  const [playerGames, setPlayerGames] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [user]);

  const loadGames = async () => {
    if (!user) return;
    try {
      const [available, player] = await Promise.all([
        getAvailableGames(),
        getPlayerGames(user.id),
      ]);
      setAvailableGames(available);
      setPlayerGames(player);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoadingAvailable(false);
      setIsLoadingPlayer(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      setIsCreating(true);
      const gameId = await createGame(user.id, user.name);
      toast.success('Game created! Waiting for opponent...');
      navigate(`/game/${gameId}`);
    } catch (error) {
      toast.error('Failed to create game: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      setIsJoining(true);
      setSelectedGameId(gameId);
      await joinGame(gameId, user.id, user.name);
      toast.success('Joined game!');
      navigate(`/game/${gameId}`);
    } catch (error) {
      toast.error('Failed to join game: ' + error.message);
      setSelectedGameId(null);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Stratego Arena</h1>
          <p className="text-slate-300">Welcome, {user?.name}!</p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Button
            onClick={handleCreateGame}
            disabled={isCreating}
            size="lg"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create New Game
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Active Games */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Games</h2>
            {isLoadingPlayer ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : playerGames.length === 0 ? (
              <Card className="p-6 bg-slate-800 border-slate-700 text-center">
                <p className="text-slate-400">No active games</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {playerGames.map(game => (
                  <Card
                    key={game.id}
                    className="p-4 bg-slate-800 border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          vs {
                            game.redPlayer === user.id
                              ? game.bluePlayerName || 'Waiting...'
                              : game.redPlayerName
                          }
                        </p>
                        <p className="text-sm text-slate-400">
                          Status: <span className="capitalize">{game.status}</span>
                        </p>
                        <p className="text-sm text-slate-400">
                          You are: <span className="font-semibold text-blue-400">
                            {game.redPlayer === user.id ? 'Red' : 'Blue'}
                          </span>
                        </p>
                      </div>
                      <Play className="w-4 h-4 text-green-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Available Games to Join */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Available Games</h2>
            {isLoadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : availableGames.length === 0 ? (
              <Card className="p-6 bg-slate-800 border-slate-700 text-center">
                <p className="text-slate-400">No games available</p>
                <p className="text-sm text-slate-500 mt-2">Create one to get started!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableGames.map(game => (
                  <Card
                    key={game.id}
                    className="p-4 bg-slate-800 border-slate-700 hover:bg-slate-700 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {game.createdByName}
                        </p>
                        <p className="text-sm text-slate-400">
                          ID: {game.id.substring(0, 8)}...
                        </p>
                      </div>
                      <Button
                        onClick={() => handleJoinGame(game.id)}
                        disabled={isJoining && selectedGameId === game.id}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {isJoining && selectedGameId === game.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Join
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}