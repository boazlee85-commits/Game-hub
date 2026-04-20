import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
const GAMES_COLLECTION = 'games';
const MOVES_COLLECTION = 'moves';
const PLAYERS_COLLECTION = 'players';

/**
 * Create a new game session
 * @param {string} playerId - Current player's ID
 * @param {string} playerName - Current player's name
 * @returns {Promise<string>} Game ID
 */
export async function createGame(playerId, playerName) {
  const gameId = doc(collection(db, GAMES_COLLECTION)).id;
  const gameData = {
    id: gameId,
    createdBy: playerId,
    createdByName: playerName,
    redPlayer: playerId,
    redPlayerName: playerName,
    bluePlayer: null,
    bluePlayerName: null,
    status: 'waiting', // waiting, setup, playing, finished
    redSetupComplete: false,
    blueSetupComplete: false,
    board: null,
    redSetup: null,
    blueSetup: null,
    currentTurn: 'red',
    winner: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    moveCount: 0,
  };

  await setDoc(doc(db, GAMES_COLLECTION, gameId), gameData);
  return gameId;
}

/**
 * Join an existing game
 * @param {string} gameId - Game to join
 * @param {string} playerId - Player joining
 * @param {string} playerName - Player's name
 */
export async function joinGame(gameId, playerId, playerName) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const gameData = gameSnap.data();
  if (gameData.bluePlayer) {
    throw new Error('Game is full');
  }

  await updateDoc(gameRef, {
    bluePlayer: playerId,
    bluePlayerName: playerName,
    status: 'setup',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get game details
 * @param {string} gameId
 * @returns {Promise<Object>}
 */
export async function getGame(gameId) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  return gameSnap.data();
}

/**
 * Submit piece setup for a player
 * @param {string} gameId
 * @param {string} playerId
 * @param {Array} setup - Array of piece types
 * @param {string} color - 'red' or 'blue'
 */
export async function submitSetup(gameId, playerId, setup, color) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const updateData = {
    [`${color}Setup`]: setup,
    [`${color}SetupComplete`]: true,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(gameRef, updateData);

  // Check if both players have completed setup
  const gameSnap = await getDoc(gameRef);
  const game = gameSnap.data();

  if (game.redSetupComplete && game.blueSetupComplete) {
    // Generate initial board from setups
    const { createEmptyBoard, placeSetup } = await import('./strategoEngine');
    const board = createEmptyBoard();
    const redBoard = placeSetup(board, game.redSetup, 'red');
    const blueBoard = placeSetup(redBoard, game.blueSetup, 'blue');

    await updateDoc(gameRef, {
      board: JSON.stringify(blueBoard),
      status: 'playing',
      currentTurn: 'red',
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Make a move in the game
 * @param {string} gameId
 * @param {string} playerId
 * @param {Object} move - { fromRow, fromCol, toRow, toCol }
 * @returns {Promise<Object>} Battle result if applicable
 */
export async function makeMove(gameId, playerId, move) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data();

  // Verify it's the player's turn
  const playerColor = game.redPlayer === playerId ? 'red' : 'blue';
  if (game.currentTurn !== playerColor) {
    throw new Error('Not your turn');
  }

  // Import game engine functions
  const { makeMove: executeMove, checkGameOver } = await import('./strategoEngine');

  // Parse board
  const board = JSON.parse(game.board);

  // Execute move
  const { board: newBoard, battleResult } = executeMove(
    board,
    move.fromRow,
    move.fromCol,
    move.toRow,
    move.toCol
  );

  // Check for game over
  const winner = checkGameOver(newBoard);

  // Create move record
  const movesRef = collection(db, GAMES_COLLECTION, gameId, MOVES_COLLECTION);
  await setDoc(doc(movesRef), {
    moveNumber: game.moveCount + 1,
    player: playerColor,
    from: { row: move.fromRow, col: move.fromCol },
    to: { row: move.toRow, col: move.toCol },
    battleResult: battleResult || null,
    timestamp: serverTimestamp(),
  });

  // Update game state
  const nextTurn = playerColor === 'red' ? 'blue' : 'red';
  const updateData = {
    board: JSON.stringify(newBoard),
    currentTurn: winner ? null : nextTurn,
    winner: winner || null,
    status: winner ? 'finished' : 'playing',
    moveCount: game.moveCount + 1,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(gameRef, updateData);

  return {
    battleResult,
    winner,
    board: newBoard,
  };
}

/**
 * Get all active games (waiting for players)
 * @returns {Promise<Array>}
 */
export async function getAvailableGames() {
  const q = query(
    collection(db, GAMES_COLLECTION),
    where('status', '==', 'waiting'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Get player's active games
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export async function getPlayerGames(playerId) {
  const q = query(
    collection(db, GAMES_COLLECTION),
    where('status', 'in', ['setup', 'playing']),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => doc.data())
    .filter(
      game =>
        game.redPlayer === playerId ||
        game.bluePlayer === playerId
    );
}

/**
 * Get game move history
 * @param {string} gameId
 * @returns {Promise<Array>}
 */
export async function getGameHistory(gameId) {
  const movesRef = collection(db, GAMES_COLLECTION, gameId, MOVES_COLLECTION);
  const q = query(movesRef, orderBy('moveNumber', 'asc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Set up real-time listener for game changes
 * @param {string} gameId
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToGame(gameId, callback) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  return onSnapshot(gameRef, snapshot => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
}

/**
 * Delete a game
 * @param {string} gameId
 */
export async function deleteGame(gameId) {
  // Delete all moves first
  const movesRef = collection(db, GAMES_COLLECTION, gameId, MOVES_COLLECTION);
  const movesSnap = await getDocs(movesRef);

  const batch = writeBatch(db);
  movesSnap.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete the game
  batch.delete(doc(db, GAMES_COLLECTION, gameId));
  await batch.commit();
}

/**
 * Resign from a game
 * @param {string} gameId
 * @param {string} playerId
 */
export async function resignGame(gameId, playerId) {
  const gameRef = doc(db, GAMES_COLLECTION, gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data();
  const winner = game.redPlayer === playerId ? 'blue' : 'red';

  await updateDoc(gameRef, {
    status: 'finished',
    winner,
    updatedAt: serverTimestamp(),
  });
}
