// Stratego Game Engine

export const PIECES = {
  FLAG: { rank: 'F', name: 'Flag', count: 1, movable: false },
  BOMB: { rank: 'B', name: 'Bomb', count: 6, movable: false },
  SPY: { rank: 'S', name: 'Spy', count: 1, movable: true },
  SCOUT: { rank: '2', name: 'Scout', count: 8, movable: true, scout: true },
  MINER: { rank: '3', name: 'Miner', count: 5, movable: true, miner: true },
  SERGEANT: { rank: '4', name: 'Sergeant', count: 4, movable: true },
  LIEUTENANT: { rank: '5', name: 'Lieutenant', count: 4, movable: true },
  CAPTAIN: { rank: '6', name: 'Captain', count: 4, movable: true },
  MAJOR: { rank: '7', name: 'Major', count: 3, movable: true },
  COLONEL: { rank: '8', name: 'Colonel', count: 2, movable: true },
  GENERAL: { rank: '9', name: 'General', count: 1, movable: true },
  MARSHAL: { rank: '10', name: 'Marshal', count: 1, movable: true },
};

export const PIECE_ORDER = ['FLAG','BOMB','SPY','SCOUT','MINER','SERGEANT','LIEUTENANT','CAPTAIN','MAJOR','COLONEL','GENERAL','MARSHAL'];

export const RANK_VALUE = { 'F': 0, 'B': 0, 'S': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10 };

export const LAKE_CELLS = [
  [4, 2], [4, 3], [5, 2], [5, 3],
  [4, 6], [4, 7], [5, 6], [5, 7],
];

export function isLake(row, col) {
  return LAKE_CELLS.some(([r, c]) => r === row && c === col);
}

export function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < 10; r++) {
    board[r] = [];
    for (let c = 0; c < 10; c++) {
      board[r][c] = isLake(r, c) ? { type: 'lake' } : null;
    }
  }
  return board;
}

export function getDefaultSetup() {
  // Returns an array of piece keys in a standard arrangement for rows 6-9 (player's side)
  const pieces = [];
  for (const key of PIECE_ORDER) {
    for (let i = 0; i < PIECES[key].count; i++) {
      pieces.push(key);
    }
  }
  // Shuffle
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

export function placeSetup(board, pieces, player) {
  const newBoard = board.map(row => [...row]);
  let idx = 0;
  const startRow = player === 'red' ? 6 : 0;
  const endRow = player === 'red' ? 10 : 4;
  for (let r = startRow; r < endRow; r++) {
    for (let c = 0; c < 10; c++) {
      if (!isLake(r, c) && idx < pieces.length) {
        newBoard[r][c] = { type: pieces[idx], player, revealed: false };
        idx++;
      }
    }
  }
  return newBoard;
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece || piece.type === 'lake') return [];
  const pieceInfo = PIECES[piece.type];
  if (!pieceInfo || !pieceInfo.movable) return [];

  const moves = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  for (const [dr, dc] of directions) {
    const maxDist = pieceInfo.scout ? 9 : 1;
    for (let dist = 1; dist <= maxDist; dist++) {
      const nr = row + dr * dist;
      const nc = col + dc * dist;
      if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) break;
      if (isLake(nr, nc)) break;
      const target = board[nr][nc];
      if (!target) {
        moves.push([nr, nc]);
      } else if (target.player !== piece.player) {
        moves.push([nr, nc]);
        break;
      } else {
        break;
      }
    }
  }
  return moves;
}

export function resolveBattle(attacker, defender) {
  const aRank = PIECES[attacker.type].rank;
  const dRank = PIECES[defender.type].rank;

  // Spy kills Marshal
  if (aRank === 'S' && dRank === '10') return 'attacker';
  // Miner defuses bomb
  if (PIECES[attacker.type].miner && dRank === 'B') return 'attacker';
  // Anything hitting a bomb dies (except miner)
  if (dRank === 'B') return 'defender';
  // Flag captured
  if (dRank === 'F') return 'attacker';

  const aVal = RANK_VALUE[aRank];
  const dVal = RANK_VALUE[dRank];

  if (aVal > dVal) return 'attacker';
  if (dVal > aVal) return 'defender';
  return 'both'; // tie - both die
}

export function makeMove(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = board.map(row => [...row]);
  const attacker = { ...newBoard[fromRow][fromCol] };
  const target = newBoard[toRow][toCol];

  let battleResult = null;

  if (target && target.player !== attacker.player) {
    const result = resolveBattle(attacker, target);
    battleResult = {
      attacker: { ...attacker, revealed: true },
      defender: { ...target, revealed: true },
      result,
    };
    if (result === 'attacker') {
      newBoard[toRow][toCol] = { ...attacker, revealed: true };
      newBoard[fromRow][fromCol] = null;
    } else if (result === 'defender') {
      newBoard[toRow][toCol] = { ...target, revealed: true };
      newBoard[fromRow][fromCol] = null;
    } else {
      newBoard[toRow][toCol] = null;
      newBoard[fromRow][fromCol] = null;
    }
  } else {
    newBoard[toRow][toCol] = attacker;
    newBoard[fromRow][fromCol] = null;
  }

  return { board: newBoard, battleResult };
}

export function checkGameOver(board) {
  let redFlag = false, blueFlag = false;
  let redMovable = false, blueMovable = false;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = board[r][c];
      if (!cell || cell.type === 'lake') continue;
      if (cell.type === 'FLAG') {
        if (cell.player === 'red') redFlag = true;
        else blueFlag = true;
      }
      if (PIECES[cell.type]?.movable) {
        if (cell.player === 'red') redMovable = true;
        else blueMovable = true;
      }
    }
  }

  if (!blueFlag || !blueMovable) return 'red';
  if (!redFlag || !redMovable) return 'blue';
  return null;
}

export function getAIMove(board) {
  // Collect all AI (blue) movable pieces
  const moves = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = board[r][c];
      if (cell && cell.player === 'blue' && PIECES[cell.type]?.movable) {
        const valid = getValidMoves(board, r, c);
        for (const [tr, tc] of valid) {
          const target = board[tr][tc];
          const priority = target && target.player === 'red' ? 10 : 1;
          moves.push({ from: [r, c], to: [tr, tc], priority });
        }
      }
    }
  }
  if (moves.length === 0) return null;
  
  // Weighted random: prefer attacks
  const totalWeight = moves.reduce((sum, m) => sum + m.priority, 0);
  let rand = Math.random() * totalWeight;
  for (const move of moves) {
    rand -= move.priority;
    if (rand <= 0) return move;
  }
  return moves[0];
}

export function getPieceEmoji(type) {
  const emojis = {
    FLAG: '🚩', BOMB: '💣', SPY: '🕵️', SCOUT: '🏃', MINER: '⛏️',
    SERGEANT: '🎖️', LIEUTENANT: '⚔️', CAPTAIN: '🛡️', MAJOR: '⭐',
    COLONEL: '🦅', GENERAL: '👑', MARSHAL: '🏆'
  };
  return emojis[type] || '?';
}