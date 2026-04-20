import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  createEmptyBoard, getDefaultSetup, placeSetup,
  getValidMoves, makeMove, checkGameOver, getAIMove,
  isLake, PIECES, PIECE_ORDER, getPieceEmoji,
} from '@/lib/strategoEngine';
import GameBoard from '@/components/game/GameBoard';
import PlayerBar from '@/components/game/PlayerBar';
import BattleModal from '@/components/game/BattleModal';
import GameOverModal from '@/components/game/GameOverModal';
import MoveHistory from '@/components/game/MoveHistory';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Shuffle, PlayCircle, X } from 'lucide-react';

// Build initial unplaced pieces map
function buildUnplaced() {
  return Object.fromEntries(PIECE_ORDER.map(k => [k, PIECES[k].count]));
}

export default function Play() {
  const [gamePhase, setGamePhase] = useState('setup'); // setup | playing | over
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [battleResult, setBattleResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [moves, setMoves] = useState([]);
  const [captures, setCaptures] = useState({ red: [], blue: [] });
  const aiThinking = useRef(false);

  // Setup-phase state
  const [unplaced, setUnplaced] = useState(buildUnplaced());
  const [selectedPieceType, setSelectedPieceType] = useState(null); // piece key from tray
  const [setupSelectedCell, setSetupSelectedCell] = useState(null);  // cell selected on board to move/swap

  // Total pieces still to place
  const totalUnplaced = Object.values(unplaced).reduce((a, b) => a + b, 0);
  const canStart = totalUnplaced === 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    let newBoard = createEmptyBoard();
    // AI auto-places on rows 0-3
    const aiPieces = getDefaultSetup();
    newBoard = placeSetup(newBoard, aiPieces, 'blue');
    setBoard(newBoard);
    setGamePhase('setup');
    setCurrentPlayer('red');
    setSelectedCell(null);
    setValidMoves([]);
    setBattleResult(null);
    setWinner(null);
    setMoves([]);
    setCaptures({ red: [], blue: [] });
    setUnplaced(buildUnplaced());
    setSelectedPieceType(null);
    setSetupSelectedCell(null);
    aiThinking.current = false;
  };

  const handleAutoSetup = () => {
    let newBoard = board.map(row => [...row]);
    // Clear player rows 6-9
    for (let r = 6; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c] && newBoard[r][c].player === 'red') {
          newBoard[r][c] = null;
        }
      }
    }
    const playerPieces = getDefaultSetup();
    newBoard = placeSetup(newBoard, playerPieces, 'red');
    setBoard(newBoard);
    setUnplaced(Object.fromEntries(PIECE_ORDER.map(k => [k, 0])));
    setSelectedPieceType(null);
    setSetupSelectedCell(null);
  };

  const handleClearSetup = () => {
    let newBoard = board.map(row => [...row]);
    for (let r = 6; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c] && newBoard[r][c].player === 'red') {
          newBoard[r][c] = null;
        }
      }
    }
    setBoard(newBoard);
    setUnplaced(buildUnplaced());
    setSelectedPieceType(null);
    setSetupSelectedCell(null);
  };

  const handleStartGame = () => {
    if (!canStart) return;
    setGamePhase('playing');
    setCurrentPlayer('red');
    setSelectedPieceType(null);
    setSetupSelectedCell(null);
  };

  // ---- SETUP BOARD CLICK ----
  const handleSetupCellClick = useCallback((row, col) => {
    if (isLake(row, col)) return;
    const isPlayerZone = row >= 6 && row <= 9;
    const cell = board[row][col];

    // If a piece from the tray is selected, try to place it
    if (selectedPieceType) {
      if (!isPlayerZone) return; // can only place in own zone
      const newBoard = board.map(r => [...r]);
      // If cell already has a piece, return it to unplaced
      if (cell && cell.player === 'red') {
        setUnplaced(prev => ({ ...prev, [cell.type]: prev[cell.type] + 1 }));
      }
      newBoard[row][col] = { type: selectedPieceType, player: 'red', revealed: true };
      setBoard(newBoard);
      const newUnplaced = { ...unplaced, [selectedPieceType]: unplaced[selectedPieceType] - 1 };
      setUnplaced(newUnplaced);
      // Keep selecting same type if more left, else deselect
      if (newUnplaced[selectedPieceType] > 0) {
        setSelectedPieceType(selectedPieceType);
      } else {
        setSelectedPieceType(null);
      }
      setSetupSelectedCell(null);
      return;
    }

    // If a board piece is already selected (to move/swap within player zone)
    if (setupSelectedCell) {
      const [sr, sc] = setupSelectedCell;
      if (row === sr && col === sc) {
        setSetupSelectedCell(null);
        return;
      }
      if (!isPlayerZone) {
        setSetupSelectedCell(null);
        return;
      }
      // Swap the two cells
      const newBoard = board.map(r => [...r]);
      const tmp = newBoard[row][col];
      newBoard[row][col] = newBoard[sr][sc];
      newBoard[sr][sc] = tmp;
      setBoard(newBoard);
      setSetupSelectedCell(null);
      return;
    }

    // Select a placed piece on the board to move it
    if (cell && cell.player === 'red' && isPlayerZone) {
      setSetupSelectedCell([row, col]);
      setSelectedPieceType(null);
    }
  }, [board, selectedPieceType, setupSelectedCell, unplaced]);

  // ---- GAME BOARD CLICK ----
  const handleGameCellClick = useCallback((row, col) => {
    if (gamePhase !== 'playing' || currentPlayer !== 'red' || aiThinking.current) return;
    const cell = board[row][col];

    if (selectedCell && validMoves.some(([vr, vc]) => vr === row && vc === col)) {
      const [sr, sc] = selectedCell;
      const result = makeMove(board, sr, sc, row, col);
      const moveEntry = {
        player: 'red', pieceType: board[sr][sc].type, revealed: true,
        from: [sr, sc], to: [row, col], capture: !!result.battleResult,
      };
      if (result.battleResult) {
        setBattleResult(result.battleResult);
        const newCaptures = { ...captures };
        if (result.battleResult.result === 'attacker') newCaptures.red = [...newCaptures.red, getPieceEmoji(result.battleResult.defender.type)];
        else if (result.battleResult.result === 'defender') newCaptures.blue = [...newCaptures.blue, getPieceEmoji(result.battleResult.attacker.type)];
        else { newCaptures.red = [...newCaptures.red, getPieceEmoji(result.battleResult.defender.type)]; newCaptures.blue = [...newCaptures.blue, getPieceEmoji(result.battleResult.attacker.type)]; }
        setCaptures(newCaptures);
      }
      setBoard(result.board);
      setMoves(prev => [...prev, moveEntry]);
      setSelectedCell(null);
      setValidMoves([]);
      const gameWinner = checkGameOver(result.board);
      if (gameWinner) { setWinner(gameWinner); setGamePhase('over'); return; }
      setCurrentPlayer('blue');
      return;
    }

    if (cell && cell.player === 'red' && PIECES[cell.type]?.movable) {
      setSelectedCell([row, col]);
      setValidMoves(getValidMoves(board, row, col));
    } else {
      setSelectedCell(null);
      setValidMoves([]);
    }
  }, [board, selectedCell, validMoves, gamePhase, currentPlayer, captures]);

  const handleCellClick = gamePhase === 'setup' ? handleSetupCellClick : handleGameCellClick;

  // Compute setup highlight state for board
  const setupSelected = gamePhase === 'setup' ? setupSelectedCell : null;
  const setupValidMoves = gamePhase === 'setup' && setupSelectedCell
    ? (() => {
        const moves = [];
        for (let r = 6; r <= 9; r++)
          for (let c = 0; c < 10; c++)
            if (!(r === setupSelectedCell[0] && c === setupSelectedCell[1]) && !isLake(r, c))
              moves.push([r, c]);
        return moves;
      })()
    : [];

  // AI turn
  useEffect(() => {
    if (gamePhase !== 'playing' || currentPlayer !== 'blue') return;
    aiThinking.current = true;
    const timeout = setTimeout(() => {
      const aiMove = getAIMove(board);
      if (!aiMove) { setWinner('red'); setGamePhase('over'); aiThinking.current = false; return; }
      const [fr, fc] = aiMove.from;
      const [tr, tc] = aiMove.to;
      const result = makeMove(board, fr, fc, tr, tc);
      const moveEntry = { player: 'blue', pieceType: board[fr][fc].type, revealed: !!result.battleResult, from: [fr, fc], to: [tr, tc], capture: !!result.battleResult };
      if (result.battleResult) {
        setBattleResult(result.battleResult);
        const newCaptures = { ...captures };
        if (result.battleResult.result === 'attacker') newCaptures.blue = [...newCaptures.blue, getPieceEmoji(result.battleResult.defender.type)];
        else if (result.battleResult.result === 'defender') newCaptures.red = [...newCaptures.red, getPieceEmoji(result.battleResult.attacker.type)];
        else { newCaptures.blue = [...newCaptures.blue, getPieceEmoji(result.battleResult.defender.type)]; newCaptures.red = [...newCaptures.red, getPieceEmoji(result.battleResult.attacker.type)]; }
        setCaptures(newCaptures);
      }
      setBoard(result.board);
      setMoves(prev => [...prev, moveEntry]);
      const gameWinner = checkGameOver(result.board);
      if (gameWinner) { setWinner(gameWinner); setGamePhase('over'); aiThinking.current = false; return; }
      setCurrentPlayer('red');
      aiThinking.current = false;
    }, 600);
    return () => clearTimeout(timeout);
  }, [currentPlayer, gamePhase]);

  const handleBattleClose = () => setBattleResult(null);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Main board area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 min-w-0">
        <div className="w-full max-w-[520px] mb-3">
          <PlayerBar
            name="AI Opponent" color="blue"
            isActive={currentPlayer === 'blue' && gamePhase === 'playing'}
            captures={captures.blue} avatar="🤖"
          />
        </div>
        <div className="w-full max-w-[520px] relative">
          <GameBoard
            board={board}
            selectedCell={gamePhase === 'setup' ? setupSelectedCell : selectedCell}
            validMoves={gamePhase === 'setup' ? setupValidMoves : validMoves}
            currentPlayer={currentPlayer}
            onCellClick={handleCellClick}
            gamePhase={gamePhase}
            setupHighlightZone={gamePhase === 'setup'}
            selectedPieceType={selectedPieceType}
          />
          <BattleModal battle={battleResult} onClose={handleBattleClose} />
          {gamePhase === 'over' && <GameOverModal winner={winner} onNewGame={initGame} />}
        </div>
        <div className="w-full max-w-[520px] mt-3">
          <PlayerBar
            name="You" color="red"
            isActive={currentPlayer === 'red' && gamePhase === 'playing'}
            captures={captures.red} avatar="🎯"
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 lg:p-5 overflow-auto">
        {gamePhase === 'setup' ? (
          <SetupSidebar
            unplaced={unplaced}
            selectedPieceType={selectedPieceType}
            onSelectPiece={setSelectedPieceType}
            onAutoSetup={handleAutoSetup}
            onClear={handleClearSetup}
            onStartGame={handleStartGame}
            canStart={canStart}
            totalUnplaced={totalUnplaced}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Game</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={initGame}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            <div className={`text-center py-2 px-3 rounded-lg text-sm font-medium ${
              currentPlayer === 'red' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              {currentPlayer === 'red' ? 'Your turn' : 'AI thinking...'}
            </div>
            <Tabs defaultValue="moves" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="moves" className="flex-1 text-xs">Moves</TabsTrigger>
                <TabsTrigger value="pieces" className="flex-1 text-xs">Pieces</TabsTrigger>
              </TabsList>
              <TabsContent value="moves">
                <MoveHistory moves={moves} />
              </TabsContent>
              <TabsContent value="pieces">
                <div className="grid grid-cols-2 gap-1.5 p-1">
                  {PIECE_ORDER.map(key => (
                    <div key={key} className="flex items-center gap-1.5 text-xs bg-muted/50 rounded px-2 py-1.5">
                      <span>{getPieceEmoji(key)}</span>
                      <span className="text-muted-foreground">{PIECES[key].name}</span>
                      <span className="ml-auto font-mono text-foreground">{PIECES[key].rank}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Setup sidebar component ----
function SetupSidebar({ unplaced, selectedPieceType, onSelectPiece, onAutoSetup, onClear, onStartGame, canStart, totalUnplaced }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm text-foreground">Deploy Your Army</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {totalUnplaced > 0
            ? `Click a piece below, then click a cell in your zone (bottom 4 rows) to place it. Click a placed piece on the board to swap it.`
            : 'All pieces placed! Click Play to start.'}
        </p>
      </div>

      {totalUnplaced > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400 font-medium">
          {totalUnplaced} piece{totalUnplaced !== 1 ? 's' : ''} left to place
        </div>
      )}

      {/* Piece tray */}
      <div className="grid grid-cols-2 gap-1.5">
        {PIECE_ORDER.map(key => {
          const count = unplaced[key];
          const isSelected = selectedPieceType === key;
          const exhausted = count === 0;
          return (
            <button
              key={key}
              disabled={exhausted}
              onClick={() => onSelectPiece(isSelected ? null : key)}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg border text-left transition-all duration-150 text-xs ${
                isSelected
                  ? 'border-primary bg-primary/15 ring-1 ring-primary'
                  : exhausted
                  ? 'border-border/30 bg-muted/20 opacity-40 cursor-not-allowed'
                  : 'border-border bg-muted/40 hover:bg-muted hover:border-primary/50 cursor-pointer'
              }`}
            >
              {/* Mini rook SVG */}
              <svg viewBox="0 0 40 44" className="w-6 h-7 shrink-0">
                <rect x="3"  y="2"  width="8" height="9" rx="1.5" fill="#c0392b" />
                <rect x="16" y="2"  width="8" height="9" rx="1.5" fill="#c0392b" />
                <rect x="29" y="2"  width="8" height="9" rx="1.5" fill="#c0392b" />
                <rect x="2" y="10" width="36" height="24" rx="3" fill="#922b21" />
                <rect x="0" y="34" width="40" height="8" rx="3" fill="#7b241c" />
                <text x="20" y="25" textAnchor="middle" dominantBaseline="middle"
                  fontSize={PIECES[key].rank.length > 1 ? "10" : "12"} fontWeight="bold"
                  fontFamily="sans-serif" fill="white">{PIECES[key].rank}</text>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{PIECES[key].name}</div>
                <div className="text-muted-foreground">×{count} left</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={onAutoSetup} variant="secondary" size="sm" className="flex-1 gap-1.5 text-xs">
          <Shuffle className="w-3.5 h-3.5" /> Auto
        </Button>
        <Button onClick={onClear} variant="ghost" size="sm" className="gap-1.5 text-xs">
          <X className="w-3.5 h-3.5" /> Clear
        </Button>
      </div>

      <Button
        onClick={onStartGame}
        disabled={!canStart}
        className="w-full gap-2 bg-primary hover:bg-primary/90 text-sm font-semibold"
      >
        <PlayCircle className="w-4 h-4" />
        {canStart ? 'Start Game!' : `Place ${Object.values(unplaced).reduce((a,b)=>a+b,0)} more pieces`}
      </Button>
    </div>
  );
}