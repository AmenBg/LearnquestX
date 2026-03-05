import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniGames } from '@/lib/miniGames';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, Timer } from 'lucide-react';

// Math Speed Challenge game
function MathSpeedGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = useCallback(() => {
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 50) + 1;
    let b = Math.floor(Math.random() * 30) + 1;
    if (op === '-' && b > a) [a, b] = [b, a];
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const opts = [answer];
    while (opts.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 20) - 10;
      if (wrong !== answer && wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    opts.sort(() => Math.random() - 0.5);
    setQuestion({ a, b, op, answer });
    setOptions(opts);
    setFeedback(null);
  }, []);

  useEffect(() => { generateQuestion(); }, [generateQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const handleAnswer = (val: number) => {
    if (val === question.answer) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(generateQuestion, 300);
  };

  return (
    <div className="text-center">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 text-lg font-bold ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Timer className="h-5 w-5" /> {timeLeft}s
        </span>
      </div>
      <div className={`mb-8 rounded-xl border p-8 text-center transition-colors ${
        feedback === 'correct' ? 'border-primary bg-primary/10' : feedback === 'wrong' ? 'border-destructive bg-destructive/10' : 'border-border bg-card'
      }`}>
        <p className="text-4xl font-bold text-foreground">{question.a} {question.op} {question.b} = ?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="rounded-xl border border-border bg-card p-4 text-xl font-bold text-foreground transition-all hover:border-primary/30 hover:bg-muted active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Memory Match game
function MemoryMatchGame({ onFinish }: { onFinish: (score: number) => void }) {
  const emojis = ['🎯', '🔥', '⚡', '🎮', '🏆', '💎', '🌟', '🎪'];
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const doubled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(doubled.map(e => ({ emoji: e, flipped: false, matched: false })));
  }, []);

  const handleClick = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards([...newCards]);
        setMatches(m => {
          const newM = m + 1;
          if (newM === emojis.length) setTimeout(() => onFinish(Math.max(0, 100 - moves)), 500);
          return newM;
        });
        setSelected([]);
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Matches: {matches}/{emojis.length}</span>
        <span>Moves: {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`flex h-20 items-center justify-center rounded-xl border text-3xl transition-all ${
              card.flipped || card.matched
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/20'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Reaction Speed game
function ReactionSpeedGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'done'>('waiting');
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startRound = () => {
    setState('ready');
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') { startRound(); return; }
    if (state === 'ready') {
      clearTimeout(timeoutRef.current);
      setState('waiting');
      return;
    }
    if (state === 'go') {
      const reaction = Date.now() - startTime;
      const newTimes = [...times, reaction];
      setTimes(newTimes);
      if (newTimes.length >= 5) {
        const avg = newTimes.reduce((a, b) => a + b) / newTimes.length;
        setState('done');
        onFinish(Math.max(0, Math.round(500 - avg)));
      } else {
        setState('waiting');
      }
    }
  };

  if (state === 'done') return null;

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-muted-foreground">Round {times.length + 1}/5</p>
      <button
        onClick={handleClick}
        className={`w-full rounded-xl border p-16 text-xl font-bold transition-all ${
          state === 'waiting' ? 'border-border bg-card text-foreground' :
          state === 'ready' ? 'border-destructive bg-destructive/20 text-destructive' :
          'border-primary bg-primary/20 text-primary'
        }`}
      >
        {state === 'waiting' ? 'Click to Start' : state === 'ready' ? 'Wait...' : 'CLICK NOW!'}
      </button>
      {times.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Last: {times[times.length - 1]}ms | Avg: {Math.round(times.reduce((a, b) => a + b) / times.length)}ms
        </p>
      )}
    </div>
  );
}

// Pattern Memory game
function PatternMemoryGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const generatePattern = useCallback((len: number) => {
    const p = Array.from({ length: len }, () => Math.floor(Math.random() * 9));
    setPattern(p);
    setPlayerPattern([]);
    setShowing(true);
    // Show pattern sequentially
    p.forEach((cell, i) => {
      setTimeout(() => setActiveCell(cell), i * 600);
    });
    setTimeout(() => { setActiveCell(null); setShowing(false); }, p.length * 600 + 400);
  }, []);

  useEffect(() => { generatePattern(level + 2); }, [level, generatePattern]);

  const handleCellClick = (idx: number) => {
    if (showing) return;
    const newPlayer = [...playerPattern, idx];
    setPlayerPattern(newPlayer);
    setActiveCell(idx);
    setTimeout(() => setActiveCell(null), 200);

    if (newPlayer[newPlayer.length - 1] !== pattern[newPlayer.length - 1]) {
      onFinish(score);
      return;
    }
    if (newPlayer.length === pattern.length) {
      setScore(s => s + level * 10);
      setTimeout(() => setLevel(l => l + 1), 500);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-foreground font-bold">Level {level}</span>
        <span className="text-muted-foreground">Score: {score}</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{showing ? 'Watch the pattern...' : 'Repeat the pattern!'}</p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleCellClick(i)}
            disabled={showing}
            className={`h-20 rounded-xl border transition-all ${
              activeCell === i ? 'border-primary bg-primary/30 scale-105' : 'border-border bg-card hover:border-primary/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Brain Reflex game
function BrainReflexGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [target, setTarget] = useState({ color: '', text: '', match: false });
  const colors = ['Red', 'Blue', 'Green', 'Yellow'];
  const colorMap: Record<string, string> = { Red: 'text-destructive', Blue: 'text-secondary', Green: 'text-primary', Yellow: 'text-accent' };

  const generate = useCallback(() => {
    const textColor = colors[Math.floor(Math.random() * colors.length)];
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    setTarget({ color: displayColor, text: textColor, match: textColor === displayColor });
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const handleAnswer = (answer: boolean) => {
    if (answer === target.match) setScore(s => s + 1);
    generate();
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Timer className="h-4 w-4" /> {timeLeft}s
        </span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">Does the text color match the word?</p>
      <div className="mb-8 rounded-xl border border-border bg-card p-8">
        <p className={`text-5xl font-bold ${colorMap[target.color]}`}>{target.text}</p>
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => handleAnswer(true)} className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground">YES</button>
        <button onClick={() => handleAnswer(false)} className="rounded-xl border border-border bg-card px-8 py-3 font-bold text-foreground">NO</button>
      </div>
    </div>
  );
}

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addXp } = useApp();
  const game = miniGames.find(g => g.id === id);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  if (!game) return <div className="flex min-h-screen items-center justify-center text-foreground">Game not found</div>;

  const handleFinish = async (score: number) => {
    setFinalScore(score);
    const xpEarned = Math.round(score * 2);
    if (xpEarned > 0) await addXp(xpEarned);
  };

  const GameComponent = {
    'math-speed': MathSpeedGame,
    'memory-match': MemoryMatchGame,
    'reaction-speed': ReactionSpeedGame,
    'pattern-memory': PatternMemoryGame,
    'brain-reflex': BrainReflexGame,
  }[game.id];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-lg px-4 pt-24 pb-12">
        <button onClick={() => navigate('/store')} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        <div className="mb-6 text-center">
          <span className="text-4xl">{game.icon}</span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{game.name}</h1>
        </div>

        {finalScore !== null ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Game Over!</h2>
            <p className="mb-2 text-lg text-muted-foreground">Score: {finalScore}</p>
            <p className="mb-6 text-sm text-primary font-semibold">+{Math.round(finalScore * 2)} XP earned!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setFinalScore(null)} className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground">
                <RotateCcw className="h-4 w-4" /> Replay
              </button>
              <button onClick={() => navigate('/store')} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
                Back to Store
              </button>
            </div>
          </motion.div>
        ) : GameComponent ? (
          <GameComponent onFinish={handleFinish} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">This game is coming soon! 🚧</p>
            <button onClick={() => navigate('/store')} className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
              Back to Store
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
