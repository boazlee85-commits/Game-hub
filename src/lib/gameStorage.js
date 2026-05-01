import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const GAMES_COLLECTION = 'games';
const IDEAS_STORAGE_KEY = 'gamehub_ideas';

const normalizeGame = (docSnap) => ({
  id: docSnap.id,
  ...docSnap.data(),
});

export const gameStorage = {
  getGames: async (sortBy = '-created_date') => {
    try {
      const field = sortBy.replace('-', '');
      const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
      const queryRef = query(
        collection(db, GAMES_COLLECTION),
        orderBy(field, direction)
      );
      const snapshot = await getDocs(queryRef);
      return snapshot.docs.map(normalizeGame);
    } catch (error) {
      console.error('Error loading games from Firestore:', error);
      return [];
    }
  },

  getGamesSorted: async (sortBy = '-created_date') => {
    return gameStorage.getGames(sortBy);
  },

  subscribeGames: (callback, sortBy = '-created_date') => {
    const field = sortBy.replace('-', '');
    const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
    const queryRef = query(
      collection(db, GAMES_COLLECTION),
      orderBy(field, direction)
    );
    return onSnapshot(queryRef, (snapshot) => {
      callback(snapshot.docs.map(normalizeGame));
    });
  },

  saveGame: async (game) => {
    try {
      const gamesCollection = collection(db, GAMES_COLLECTION);
      const newDoc = doc(gamesCollection);
      const newGame = {
        ...game,
        id: newDoc.id,
        created_date: new Date().toISOString(),
        uploaded_by: 'Anonymous',
      };
      await setDoc(newDoc, newGame);
      return newGame;
    } catch (error) {
      console.error('Error saving game to Firestore:', error);
      throw error;
    }
  },

  deleteGame: async (id) => {
    try {
      await deleteDoc(doc(db, GAMES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting game from Firestore:', error);
      throw error;
    }
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
        liked_by: [],
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
      const index = ideas.findIndex((idea) => idea.id === id);
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
  },
};
