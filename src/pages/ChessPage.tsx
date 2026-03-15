import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import { chessPersonalities, ChessPersonality } from '@/lib/chessPersonalities';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, ChevronRight } from 'lucide-react';

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function getPieceSymbol(piece: { type: string; color: string } | null): string {
  if (!piece) return '';
  return PIECE_SYMBOLS[`${piece.color === 'w' ? 'w' : 'b'}${piece.type.toUpperCase()}`] || '';
}

/* ─── AI Move Logic ─── */
function evaluateBoard(chess: Chess): number {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let score = 0;
  const board = chess.board();
  for (const row of board) {
    for (const sq of row) {
      if (sq) {
        const val = values[sq.type] || 0;
        score += sq.color === 'w' ? -val : val; // AI plays black
      }
    }
  }
  return score;
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);
  const moves = chess.moves();
  if (isMax) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getAIMove(chess: Chess, personality: ChessPersonality): string | null {
  const moves = chess.moves();
  if (moves.length === 0) return null;

  // Random move based on personality randomness
  if (Math.random() < personality.randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Use minimax with limited depth
  const depth = Math.min(personality.depth, 4); // Cap at 4 for performance
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, false);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

/* ─── CHESS BOARD ─── */
function ChessBoard({ chess, onMove, playerColor, disabled }: {
  chess: Chess; onMove: (from: string, to: string) => void; playerColor: 'w'; disabled: boolean;
}) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const board = chess.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const handleSquareClick = (square: string) => {
    if (disabled) return;
    const piece = chess.get(square as Square);

    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as Square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[min(100vw-2rem,400px)]">
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden aspect-square">
        {board.map((row, ri) =>
          row.map((piece, ci) => {
            const square = `${files[ci]}${8 - ri}`;
            const isDark = (ri + ci) % 2 === 1;
            const isSelected = square === selectedSquare;
            const isLegal = legalMoves.includes(square);
            const isLastMove = chess.history({ verbose: true }).slice(-1)[0]?.from === square || chess.history({ verbose: true }).slice(-1)[0]?.to === square;

            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all relative
                  ${isDark ? 'bg-primary/20' : 'bg-card'}
                  ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}
                  ${isLastMove ? 'bg-yellow-500/20' : ''}
                `}
              >
                {isLegal && (
                  <div className={`absolute inset-0 flex items-center justify-center ${piece ? '' : ''}`}>
                    <div className={`rounded-full ${piece ? 'h-full w-full border-4 border-primary/40' : 'h-3 w-3 bg-primary/30'}`} />
                  </div>
                )}
                <span className={`relative z-10 ${piece?.color === 'b' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {getPieceSymbol(piece)}
                </span>
              </button>
            );
          })
        )}
      </div>
      <div className="mt-1 flex justify-between px-1 text-xs text-muted-foreground">
        {files.map(f => <span key={f}>{f}</span>)}
      </div>
    </div>
  );
}

/* ─── PERSONALITY SELECTION ─── */
function PersonalitySelector({ onSelect }: { onSelect: (p: ChessPersonality) => void }) {
  const [filter, setFilter] = useState<string>('all');
  const levels = ['Beginner', 'Casual', 'Intermediate', 'Advanced', 'Expert'];
  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-500/10 text-green-600 border-green-500/30',
    Casual: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    Intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    Advanced: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    Expert: 'bg-red-500/10 text-red-600 border-red-500/30',
  };

  const filtered = filter === 'all' ? chessPersonalities : chessPersonalities.filter(p => p.level === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>All (50)</button>
        {levels.map(l => (
          <button key={l} onClick={() => setFilter(l)} className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${filter === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map(p => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (p.id % 10) * 0.02 }}
            onClick={() => onSelect(p)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold text-foreground">
              {p.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${levelColors[p.level]}`}>{p.level}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN CHESS PAGE ─── */
export default function ChessPage() {
  const navigate = useNavigate();
  const { addXp } = useApp();
  const [selectedPersonality, setSelectedPersonality] = useState<ChessPersonality | null>(null);
  const [chess, setChess] = useState<Chess | null>(null);
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'finished'>('selecting');
  const [result, setResult] = useState<string>('');
  const [isAIThinking, setIsAIThinking] = useState(false);

  const startGame = (personality: ChessPersonality) => {
    setSelectedPersonality(personality);
    const c = new Chess();
    setChess(c);
    setGameState('playing');
    setResult('');
  };

  const checkGameEnd = useCallback((c: Chess) => {
    if (c.isCheckmate()) {
      const winner = c.turn() === 'w' ? 'AI' : 'You';
      setResult(winner === 'You' ? '🏆 You win!' : '😔 AI wins!');
      setGameState('finished');
      if (winner === 'You' && selectedPersonality) {
        const xp = Math.min(10, Math.ceil(selectedPersonality.id / 5));
        addXp(xp);
      }
      return true;
    }
    if (c.isDraw() || c.isStalemate() || c.isThreefoldRepetition() || c.isInsufficientMaterial()) {
      setResult('🤝 Draw!');
      setGameState('finished');
      if (selectedPersonality) addXp(3);
      return true;
    }
    return false;
  }, [selectedPersonality, addXp]);

  const handlePlayerMove = useCallback((from: string, to: string) => {
    if (!chess || !selectedPersonality || isAIThinking) return;
    const c = new Chess(chess.fen());

    try {
      // Try promotion
      const move = c.move({ from: from as Square, to: to as Square, promotion: 'q' });
      if (!move) return;
    } catch { return; }

    setChess(new Chess(c.fen()));
    if (checkGameEnd(c)) return;

    // AI move
    setIsAIThinking(true);
    setTimeout(() => {
      const aiMoveStr = getAIMove(c, selectedPersonality);
      if (aiMoveStr) {
        c.move(aiMoveStr);
        setChess(new Chess(c.fen()));
        checkGameEnd(c);
      }
      setIsAIThinking(false);
    }, 300 + Math.random() * 500);
  }, [chess, selectedPersonality, isAIThinking, checkGameEnd]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <button onClick={() => navigate('/store')} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        <div className="mb-6 text-center">
          <span className="text-4xl">♟️</span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Chess Arena</h1>
          <p className="text-sm text-muted-foreground">Play against 50 unique AI opponents</p>
        </div>

        {gameState === 'selecting' && (
          <PersonalitySelector onSelect={startGame} />
        )}

        {gameState === 'playing' && chess && selectedPersonality && (
          <div>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div>
                <p className="font-semibold text-foreground text-sm">vs. {selectedPersonality.name}</p>
                <p className="text-xs text-muted-foreground">{selectedPersonality.level} • {selectedPersonality.style}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {chess.isCheck() && <span className="text-destructive font-bold">Check!</span>}
                {isAIThinking && <span className="animate-pulse">Thinking...</span>}
              </div>
            </div>
            <ChessBoard chess={chess} onMove={handlePlayerMove} playerColor="w" disabled={isAIThinking || gameState !== 'playing'} />
            <div className="mt-4 flex justify-center">
              <button onClick={() => { setGameState('selecting'); setChess(null); }} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">Resign</button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">{result}</h2>
            {selectedPersonality && <p className="mb-2 text-sm text-muted-foreground">vs. {selectedPersonality.name}</p>}
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => selectedPersonality && startGame(selectedPersonality)} className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground">
                <RotateCcw className="h-4 w-4" /> Rematch
              </button>
              <button onClick={() => { setGameState('selecting'); setChess(null); }} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
                Choose Opponent
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
