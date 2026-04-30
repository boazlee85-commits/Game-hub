// Simple local storage service for games and ideas
const GAMES_STORAGE_KEY = 'gamehub_games';
const IDEAS_STORAGE_KEY = 'gamehub_ideas';

export const gameStorage = {
  getGames: () => {
    try {
      const games = localStorage.getItem(GAMES_STORAGE_KEY);
      return games ? JSON.parse(games) : [];
    } catch (error) {
      console.error('Error loading games:', error);
      return [];
    }
  },

  saveGame: (game) => {
    try {
      const games = gameStorage.getGames();
      const newGame = {
        ...game,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        created_date: new Date().toISOString(),
        uploaded_by: 'Anonymous' // Since no auth
      };
      games.push(newGame);
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
      return newGame;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  },

  deleteGame: (id) => {
    try {
      const games = gameStorage.getGames();
      const nextGames = games.filter(game => game.id !== id);
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(nextGames));
      return nextGames;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  },

  getGamesSorted: (sortBy = '-created_date') => {
    const games = gameStorage.getGames();
    return games.sort((a, b) => {
      const aVal = a[sortBy.replace('-', '')];
      const bVal = b[sortBy.replace('-', '')];
      const multiplier = sortBy.startsWith('-') ? -1 : 1;
      return multiplier * (aVal > bVal ? 1 : aVal < bVal ? -1 : 0);
    });
  },

  getIdeas: () => {
    try {
      const ideas = localStorage.getItem(IDEAS_STORAGE_KEY);
      return ideas ? JSON.parse(ideas) : [];
    } catch (error) {
      console.error('Error loading ideas:', error);
      return [];
    }
  },

  saveIdea: (idea) => {
    try {
      const ideas = gameStorage.getIdeas();
      const newIdea = {
        ...idea,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        likes: 0,
        liked_by: []
      };
      ideas.push(newIdea);
      localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
      return newIdea;
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  },

  updateIdea: (id, updates) => {
    try {
      const ideas = gameStorage.getIdeas();
      const index = ideas.findIndex(idea => idea.id === id);
      if (index !== -1) {
        ideas[index] = { ...ideas[index], ...updates };
        localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
        return ideas[index];
      }
      throw new Error('Idea not found');
    } catch (error) {
      console.error('Error updating idea:', error);
      throw error;
    }
  },

  getIdeasSorted: (sortBy = '-created_date') => {
    const ideas = gameStorage.getIdeas();
    return ideas.sort((a, b) => {
      const aVal = a[sortBy.replace('-', '')];
      const bVal = b[sortBy.replace('-', '')];
      const multiplier = sortBy.startsWith('-') ? -1 : 1;
      return multiplier * (aVal > bVal ? 1 : aVal < bVal ? -1 : 0);
    });
  }
};
