import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  createEmptyBoard, getDefaultSetup, placeSetup,
  getValidMoves, makeMove, checkGameOver, isLake,
  PIECES, PIECE_ORDER, getPieceEmoji,
} from '@/lib/strategoEngine';
import {
  getGame,
  submitSetup,
  makeMove as makeGameMove,
  subscribeToGame,
  resignGame,
} from '@/lib/firestoreGameService';
import GameBoard from '@/components/game/GameBoard';
import PlayerBar from '@/components/game/PlayerBar';
import BattleModal from '@/components/game/BattleModal';
import GameOverModal from '@/components/game/GameOverModal';
import { Button } from '@/components/ui/button';
import { Loader2, Shuffle, PlayCircle, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

function buildUnplaced() {
  return Object.fromEntries(PIECE_ORDER.map(k => [k, PIECES[k].count]));
}

export default function OnlineGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Game state
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [localBoard, setLocalBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [battleResult, setBattleResult] = useState(null);
  const [unplaced, setUnplaced] = useState(buildUnplaced());
  const [selectedPieceType, setSelectedPieceType] = useState(null);
  const [setupSelectedCell, setSetupSelectedCell] = useState(null);
  const [submittingSetup, setSubmittingSetup] = useState(false);
  const [makingMove, setMakingMove] = useState(false);

  // Subscribe to game updates
  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToGame(id, (updatedGame) => {
      setGame(updatedGame);
      if (updatedGame.board) {
        setLocalBoard(JSON.parse(updatedGame.board));
      } else {
        setLocalBoard(createEmptyBoard());
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-6">
        <p className="text-xl font-semibold text-foreground">Game not found</p>
        <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
      </div>
    );
  }

  const myColor = game.redPlayer === user?.id ? 'red' : 'blue';
  const oppColor = myColor === 'red' ? 'blue' : 'red';
  const mySetupDone = myColor === 'red' ? game.redSetupComplete : game.blueSetupComplete;
  const oppSetupDone = myColor === 'red' ? game.blueSetupComplete : game.redSetupComplete;
  const isMyTurn = game.status === 'playing' && game.currentTurn === myColor;

  const board = localBoard || createEmptyBoard();
  const totalUnplaced = Object.values(unplaced).reduce((a, b) => a + b, 0);
  const canSubmitSetup = totalUnplaced === 0 && !mySetupDone;

  // Setup handlers
  const handleAutoSetup = () => {
    let newBoard = board.map(r => [...r]);
    const rowStart = myColor === 'red' ? 6 : 0;
    const rowEnd = myColor === 'red' ? 10 : 4;
    for (let r = rowStart; r < rowEnd; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c]?.player === myColor) newBoard[r][c] = null;
      }
    }
    const pieces = getDefaultSetup();
    newBoard = placeSetup(newBoard, pieces, myColor);
    setLocalBoard(newBoard);
    setUnplaced(Object.fromEntries(PIECE_ORDER.map(k => [k, 0])));
    setSelectedPieceType(null);
    setSetupSelectedCell(null);
  };

  const handleClearSetup = () => {
    let newBoard = board.map(r => [...r]);
    const rowStart = myColor === 'red' ? 6 : 0;
    const rowEnd = myColor === 'red' ? 10 : 4;
    for (let r = rowStart; r < rowEnd; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c]?.player === myColor) newBoard[r][c] = null;
      }
    }
    setLocalBoard(newBoard);
    setUnplaced(buildUnplaced());
  };

  const handleSubmitSetup = async () => {
    try {
      setSubmittingSetup(true);
      // Extract setup array from board
      const setupArray = [];
      const rowStart = myColor === 'red' ? 6 : 0;
      const rowEnd = myColor === 'red' ? 10 : 4;
      
      for (let r = rowStart; r < rowEnd; r++) {
        for (let c = 0; c < 10; c++) {
          if (board[r][c]?.player === myColor) {
            setupArray.push(board[r][c].type);
          }
        }
      }

      await submitSetup(id, user.id, setupArray, myColor);
      toast.success('Setup submitted!');
    } catch (error) {
      toast.error('Failed to submit setup: ' + error.message);
    } finally {
      setSubmittingSetup(false);
    }
  };

  const handleSetupCellClick = useCallback((row, col) => {
    if (isLake(row, col)) return;
    const rowStart = myColor === 'red' ? 6 : 0;
    const rowEnd = myColor === 'red' ? 10 : 4;
    const isMyZone = row >= rowStart && row < rowEnd;
    const cell = board[row][col];

    if (selectedPieceType) {
      if (!isMyZone) return;
      const newBoard = board.map(r => [...r]);
      if (cell?.player === myColor) {
        setUnplaced(prev => ({ ...prev, [cell.type]: prev[cell.type] + 1 }));
      }
      newBoard[row][col] = { type: selectedPieceType, player: myColor, revealed: true };
      setLocalBoard(newBoard);
      const newUnplaced = { ...unplaced, [selectedPieceType]: unplaced[selectedPieceType] - 1 };
      setUnplaced(newUnplaced);
      setSelectedPieceType(newUnplaced[selectedPieceType] > 0 ? selectedPieceType : null);
      setSetupSelectedCell(null);
      return;
    }

    if (setupSelectedCell) {
      const [sr, sc] = setupSelectedCell;
      if (row === sr && col === sc) {
        setSetupSelectedCell(null);
        return;
      }
      if (!isMyZone) {
        setSetupSelectedCell(null);
        return;
      }
      const newBoard = board.map(r => [...r]);
      [newBoard[row][col], newBoard[sr][sc]] = [newBoard[sr][sc], newBoard[row][col]];
      setLocalBoard(newBoard);
      setSetupSelectedCell(null);
      return;
    }

    if (cell?.player === myColor && isMyZone) {
      setSetupSelectedCell([row, col]);
      setSelectedPieceType(null);
    }
  }, [board, selectedPieceType, setupSelectedCell, unplaced, myColor]);

  const handleGameCellClick = useCallback((row, col) => {
    if (!isMyTurn) return;
    const cell = board[row][col];

    if (selectedCell && validMoves.some(([vr, vc]) => vr === row && vc === col)) {
      const [sr, sc] = selectedCell;
      makeGameMove(id, user.id, { fromRow: sr, fromCol: sc, toRow: row, toCol: col })
        .then(result => {
          if (result.battleResult) {
            setBattleResult(result.battleResult);
          }
        })
        .catch(error => {
          toast.error('Move failed: ' + error.message);
        })
        .finally(() => {
          setMakingMove(false);
        });
      
      setMakingMove(true);
      setSelectedCell(null);
      setValidMoves([]);
      return;
    }

    if (cell?.player === myColor && PIECES[cell.type]?.movable) {
      setSelectedCell([row, col]);
      setValidMoves(getValidMoves(board, row, col));
    } else {
      setSelectedCell(null);
      setValidMoves([]);
    }
  }, [board, selectedCell, validMoves, isMyTurn, myColor, user, id]);

  const handleCellClick = (game.status === 'setup' && !mySetupDone)
    ? handleSetupCellClick
    : handleGameCellClick;

  const setupValidMoves = (game.status === 'setup' && setupSelectedCell)
    ? (() => {
        const rowStart = myColor === 'red' ? 6 : 0;
        const rowEnd = myColor === 'red' ? 10 : 4;
        const mvs = [];
        for (let r = rowStart; r < rowEnd; r++) {
          for (let c = 0; c < 10; c++) {
            if (!(r === setupSelectedCell[0] && c === setupSelectedCell[1]) && !isLake(r, c)) {
              mvs.push([r, c]);
            }
          }
        }
        return mvs;
      })()
    : [];

  // Waiting for opponent
  if (game.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Waiting for opponent…</h2>
          <p className="text-muted-foreground text-sm mt-1">Share this link with a friend!</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
          }}
        >
          <Copy className="w-4 h-4" /> Copy Game Link
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')}>
          ← Back to Lobby
        </Button>
      </div>
    );
  }

  const oppName = myColor === 'red' ? (game.bluePlayerName || 'Opponent') : (game.redPlayerName || 'Opponent');
  const myName = myColor === 'red' ? (game.redPlayerName || 'You') : (game.bluePlayerName || 'You');

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 min-w-0">
        <div className="w-full max-w-[520px] mb-3">
          <PlayerBar
            name={oppName}
            color={oppColor}
            isActive={game.status === 'playing' && game.currentTurn === oppColor}
            captures={[]}
            avatar="👤"
          />
        </div>
        <div className="w-full max-w-[520px] relative">
          <GameBoard
            board={board}
            selectedCell={game.status === 'setup' ? setupSelectedCell : selectedCell}
            validMoves={game.status === 'setup' ? setupValidMoves : validMoves}
            currentPlayer={myColor}
            onCellClick={handleCellClick}
            gamePhase={game.status === 'setup' && !mySetupDone ? 'setup' : 'playing'}
            setupHighlightZone={game.status === 'setup' && !mySetupDone}
            selectedPieceType={selectedPieceType}
            flipped={myColor === 'blue'}
          />
          <BattleModal battle={battleResult} onClose={() => setBattleResult(null)} />
          {game.status === 'finished' && (
            <GameOverModal
              winner={game.winner}
              myColor={myColor}
              onNewGame={() => navigate('/lobby')}
            />
          )}
        </div>
        <div className="w-full max-w-[520px] mt-3">
          <PlayerBar
            name={myName}
            color={myColor}
            isActive={game.status === 'playing' && isMyTurn}
            captures={[]}
            avatar="🎯"
          />
        </div>
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 lg:p-5 overflow-auto">
        {game.status === 'setup' ? (
          <OnlineSetupSidebar
            mySetupDone={mySetupDone}
            oppSetupDone={oppSetupDone}
            unplaced={unplaced}
            selectedPieceType={selectedPieceType}
            onSelectPiece={setSelectedPieceType}
            onAutoSetup={handleAutoSetup}
            onClear={handleClearSetup}
            onSubmit={handleSubmitSetup}
            canSubmit={canSubmitSetup}
            submitting={submittingSetup}
            totalUnplaced={totalUnplaced}
          />
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Game</h3>
            <div
              className={`text-center py-2 px-3 rounded-lg text-sm font-medium ${
                isMyTurn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {isMyTurn ? 'Your turn!' : `${oppName}'s turn…`}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => resignGame(id, user.id).then(() => navigate('/lobby'))}
            >
              Resign
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/lobby')}>
              ← Back to Lobby
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OnlineSetupSidebar({
  mySetupDone,
  oppSetupDone,
  unplaced,
  selectedPieceType,
  onSelectPiece,
  onAutoSetup,
  onClear,
  onSubmit,
  canSubmit,
  submitting,
  totalUnplaced,
}) {
  if (mySetupDone) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="text-4xl">✅</div>
        <p className="font-semibold text-foreground">Setup submitted!</p>
        <p className="text-sm text-muted-foreground">
          {oppSetupDone ? 'Both ready — game starting!' : 'Waiting for opponent to finish setup…'}
        </p>
        {!oppSetupDone && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm text-foreground">Deploy Your Army</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {totalUnplaced > 0
            ? `${totalUnplaced} piece${totalUnplaced !== 1 ? 's' : ''} left to place`
            : 'All pieces placed!'}
        </p>
      </div>
      {oppSetupDone && !mySetupDone && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs text-primary font-medium">
          Opponent is ready and waiting for you!
        </div>
      )}
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
              className={`flex items-center gap-2 px-2 py-2 rounded-lg border text-left transition-all text-xs ${
                isSelected
                  ? 'border-primary bg-primary/15 ring-1 ring-primary'
                  : exhausted
                  ? 'border-border/30 bg-muted/20 opacity-40 cursor-not-allowed'
                  : 'border-border bg-muted/40 hover:bg-muted cursor-pointer'
              }`}
            >
              <span className="text-base">{getPieceEmoji(key)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{PIECES[key].name}</div>
                <div className="text-muted-foreground">×{count}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button onClick={onAutoSetup} variant="secondary" size="sm" className="flex-1 gap-1 text-xs">
          <Shuffle className="w-3 h-3" /> Auto
        </Button>
        <Button onClick={onClear} variant="ghost" size="sm" className="gap-1 text-xs">
          <X className="w-3 h-3" /> Clear
        </Button>
      </div>
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="w-full gap-2 text-sm font-semibold"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlayCircle className="w-4 h-4" />
        )}
        {canSubmit ? 'Ready!' : `Place ${totalUnplaced} more`}
      </Button>
    </div>
  );
}