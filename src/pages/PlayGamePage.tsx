import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { miniGames } from '@/lib/miniGames';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, Timer } from 'lucide-react';

/* ─── MATH-TYPE GAMES ─── */
function MathGame({ onFinish, variant }: { onFinish: (s: number) => void; variant: string }) {
  const [score, setScore] = useState(0);
  const duration = variant === 'calculation-marathon' ? 60 : variant === 'mental-math-sprint' ? 20 : 30;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [question, setQuestion] = useState({ text: '', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = useCallback(() => {
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    const hard = ['number-ninja', 'mental-math-sprint', 'calculation-marathon'].includes(variant);
    const max = hard ? 100 : 50;
    let a = Math.floor(Math.random() * max) + 1;
    let b = Math.floor(Math.random() * (hard ? 50 : 30)) + 1;
    if (op === '-' && b > a) [a, b] = [b, a];
    if (op === '×') { a = Math.floor(Math.random() * (hard ? 20 : 12)) + 1; b = Math.floor(Math.random() * 12) + 1; }
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const opts = [answer];
    while (opts.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 20) - 10;
      if (wrong !== answer && wrong >= 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    opts.sort(() => Math.random() - 0.5);
    setQuestion({ text: `${a} ${op} ${b} = ?`, answer });
    setOptions(opts);
    setFeedback(null);
  }, [variant]);

  useEffect(() => { generateQuestion(); }, [generateQuestion]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const handleAnswer = (val: number) => {
    if (val === question.answer) { setScore(s => s + 1); setFeedback('correct'); }
    else setFeedback('wrong');
    setTimeout(generateQuestion, 250);
  };

  return (
    <div className="text-center">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 text-lg font-bold ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Timer className="h-5 w-5" /> {timeLeft}s
        </span>
      </div>
      <div className={`mb-8 rounded-xl border p-8 transition-colors ${feedback === 'correct' ? 'border-primary bg-primary/10' : feedback === 'wrong' ? 'border-destructive bg-destructive/10' : 'border-border bg-card'}`}>
        <p className="text-4xl font-bold text-foreground">{question.text}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} className="rounded-xl border border-border bg-card p-4 text-xl font-bold text-foreground transition-all hover:border-primary/30 active:scale-95">{opt}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── MEMORY MATCH ─── */
function MemoryMatchGame({ onFinish, gridSize = 4 }: { onFinish: (s: number) => void; gridSize?: number }) {
  const emojiSets = ['🎯', '🔥', '⚡', '🎮', '🏆', '💎', '🌟', '🎪', '🎸', '🚀', '🌈', '🦋', '🎭', '🎨', '🏅', '🧲', '🔮', '🎲'];
  const pairs = (gridSize * gridSize) / 2;
  const emojis = emojiSets.slice(0, pairs);
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const doubled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(doubled.map(e => ({ emoji: e, flipped: false, matched: false })));
  }, []);

  const handleClick = (idx: number) => {
    if (cards[idx]?.flipped || cards[idx]?.matched || selected.length >= 2) return;
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newSelected = [...selected, idx];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        newCards[a].matched = true; newCards[b].matched = true;
        setCards([...newCards]);
        setMatches(m => { const n = m + 1; if (n === emojis.length) setTimeout(() => onFinish(Math.max(0, 100 - moves)), 500); return n; });
        setSelected([]);
      } else {
        setTimeout(() => { newCards[a].flipped = false; newCards[b].flipped = false; setCards([...newCards]); setSelected([]); }, 800);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Matches: {matches}/{emojis.length}</span><span>Moves: {moves}</span>
      </div>
      <div className={`grid gap-2 ${gridSize === 6 ? 'grid-cols-6' : 'grid-cols-4'}`}>
        {cards.map((card, i) => (
          <button key={i} onClick={() => handleClick(i)} className={`flex h-16 sm:h-20 items-center justify-center rounded-xl border text-2xl sm:text-3xl transition-all ${card.flipped || card.matched ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/20'}`}>
            {card.flipped || card.matched ? card.emoji : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── REACTION SPEED ─── */
function ReactionSpeedGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'done'>('waiting');
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = () => { setState('ready'); timeoutRef.current = setTimeout(() => { setState('go'); setStartTime(Date.now()); }, 1000 + Math.random() * 4000); };
  const handleClick = () => {
    if (state === 'waiting') { startRound(); return; }
    if (state === 'ready') { clearTimeout(timeoutRef.current); setState('waiting'); return; }
    if (state === 'go') {
      const reaction = Date.now() - startTime;
      const newTimes = [...times, reaction];
      setTimes(newTimes);
      if (newTimes.length >= 5) { const avg = newTimes.reduce((a, b) => a + b) / newTimes.length; setState('done'); onFinish(Math.max(0, Math.round(500 - avg))); }
      else setState('waiting');
    }
  };
  if (state === 'done') return null;

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-muted-foreground">Round {times.length + 1}/5</p>
      <button onClick={handleClick} className={`w-full rounded-xl border p-16 text-xl font-bold transition-all ${state === 'waiting' ? 'border-border bg-card text-foreground' : state === 'ready' ? 'border-destructive bg-destructive/20 text-destructive' : 'border-primary bg-primary/20 text-primary'}`}>
        {state === 'waiting' ? 'Click to Start' : state === 'ready' ? 'Wait...' : 'CLICK NOW!'}
      </button>
      {times.length > 0 && <p className="mt-4 text-sm text-muted-foreground">Last: {times[times.length - 1]}ms | Avg: {Math.round(times.reduce((a, b) => a + b) / times.length)}ms</p>}
    </div>
  );
}

/* ─── PATTERN MEMORY ─── */
function PatternMemoryGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const generatePattern = useCallback((len: number) => {
    const p = Array.from({ length: len }, () => Math.floor(Math.random() * 9));
    setPattern(p); setPlayerPattern([]); setShowing(true);
    p.forEach((cell, i) => { setTimeout(() => setActiveCell(cell), i * 600); });
    setTimeout(() => { setActiveCell(null); setShowing(false); }, p.length * 600 + 400);
  }, []);

  useEffect(() => { generatePattern(level + 2); }, [level, generatePattern]);

  const handleCellClick = (idx: number) => {
    if (showing) return;
    const newPlayer = [...playerPattern, idx];
    setPlayerPattern(newPlayer);
    setActiveCell(idx); setTimeout(() => setActiveCell(null), 200);
    if (newPlayer[newPlayer.length - 1] !== pattern[newPlayer.length - 1]) { onFinish(score); return; }
    if (newPlayer.length === pattern.length) { setScore(s => s + level * 10); setTimeout(() => setLevel(l => l + 1), 500); }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-foreground font-bold">Level {level}</span><span className="text-muted-foreground">Score: {score}</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{showing ? 'Watch the pattern...' : 'Repeat the pattern!'}</p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <button key={i} onClick={() => handleCellClick(i)} disabled={showing} className={`h-20 rounded-xl border transition-all ${activeCell === i ? 'border-primary bg-primary/30 scale-105' : 'border-border bg-card hover:border-primary/20'}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── BRAIN REFLEX (color match) ─── */
function BrainReflexGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [target, setTarget] = useState({ color: '', text: '', match: false });
  const colors = ['Red', 'Blue', 'Green', 'Yellow'];
  const colorMap: Record<string, string> = { Red: 'text-destructive', Blue: 'text-blue-500', Green: 'text-green-500', Yellow: 'text-yellow-500' };

  const generate = useCallback(() => {
    const t = colors[Math.floor(Math.random() * colors.length)];
    const d = colors[Math.floor(Math.random() * colors.length)];
    setTarget({ color: d, text: t, match: t === d });
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">Does the text color match the word?</p>
      <div className="mb-8 rounded-xl border border-border bg-card p-8">
        <p className={`text-5xl font-bold ${colorMap[target.color]}`}>{target.text}</p>
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => { if (target.match) setScore(s => s + 1); generate(); }} className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground">YES</button>
        <button onClick={() => { if (!target.match) setScore(s => s + 1); generate(); }} className="rounded-xl border border-border bg-card px-8 py-3 font-bold text-foreground">NO</button>
      </div>
    </div>
  );
}

/* ─── WORD GAME ─── */
function WordGame({ onFinish }: { onFinish: (s: number) => void }) {
  const wordBank = ['CHESS', 'BRAIN', 'LOGIC', 'SPEED', 'SMART', 'THINK', 'SOLVE', 'LEARN', 'FOCUS', 'POWER', 'DREAM', 'BUILD', 'QUEST', 'LIGHT', 'SPARK'];
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextWord = useCallback(() => {
    const w = wordBank[Math.floor(Math.random() * wordBank.length)];
    setCurrentWord(w);
    setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
    setInput(''); setFeedback(null);
  }, []);

  useEffect(() => { nextWord(); }, [nextWord]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const checkAnswer = () => {
    if (input.toUpperCase() === currentWord) { setScore(s => s + 10); setFeedback('✅ Correct!'); }
    else setFeedback('❌ Try again!');
    setTimeout(nextWord, 500);
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-2">Unscramble this word:</p>
        <p className="text-4xl font-bold text-primary tracking-widest">{scrambled}</p>
      </div>
      {feedback && <p className="mb-2 text-sm font-bold">{feedback}</p>}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Type your answer..." className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-foreground" />
        <button onClick={checkAnswer} className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Go</button>
      </div>
    </div>
  );
}

/* ─── REFLEX CLICK (click appearing targets) ─── */
function ReflexClickGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const handleClick = () => {
    setScore(s => s + 1);
    setVisible(false);
    setTimeout(() => {
      setPos({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 });
      setVisible(true);
    }, 200);
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <div className="relative h-80 rounded-xl border border-border bg-card overflow-hidden">
        {visible && (
          <button
            onClick={handleClick}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground font-bold text-xl transition-all hover:scale-110 active:scale-90"
          >
            🎯
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── SPEED TYPING ─── */
function SpeedTypingGame({ onFinish }: { onFinish: (s: number) => void }) {
  const words = ['apple', 'brain', 'chess', 'delta', 'eagle', 'flame', 'grape', 'heart', 'ivory', 'joker', 'knight', 'lemon', 'magic', 'noble', 'ocean', 'piano', 'queen', 'river', 'solar', 'tiger'];
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  useEffect(() => {
    if (input.toLowerCase() === currentWord) {
      setScore(s => s + 1);
      setInput('');
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  }, [input, currentWord]);

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Words: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <div className="mb-6 rounded-xl border border-border bg-card p-8">
        <p className="text-4xl font-bold text-primary">{currentWord}</p>
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} autoFocus placeholder="Type the word..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-xl text-foreground" />
    </div>
  );
}

/* ─── PATTERN RECOGNITION (find the odd one) ─── */
function PatternRecognitionGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [cells, setCells] = useState<{ color: string; isOdd: boolean }[]>([]);

  const generate = useCallback(() => {
    const h = Math.floor(Math.random() * 360);
    const oddH = (h + 30 + Math.floor(Math.random() * 30)) % 360;
    const oddIdx = Math.floor(Math.random() * 16);
    setCells(Array.from({ length: 16 }, (_, i) => ({
      color: i === oddIdx ? `hsl(${oddH}, 70%, 50%)` : `hsl(${h}, 70%, 50%)`,
      isOdd: i === oddIdx
    })));
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Find the different color!</p>
      <div className="mx-auto grid w-72 grid-cols-4 gap-2">
        {cells.map((cell, i) => (
          <button key={i} onClick={() => { if (cell.isOdd) { setScore(s => s + 1); } generate(); }}
            style={{ backgroundColor: cell.color }}
            className="h-16 rounded-lg transition-all hover:scale-105 active:scale-95" />
        ))}
      </div>
    </div>
  );
}

/* ─── SEQUENCE LOGIC (find next number) ─── */
function SequenceGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  const generate = useCallback(() => {
    const type = Math.floor(Math.random() * 3);
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 2;
    let seq: number[], ans: number;
    if (type === 0) { seq = Array.from({ length: 4 }, (_, i) => start + step * i); ans = start + step * 4; }
    else if (type === 1) { seq = Array.from({ length: 4 }, (_, i) => start * Math.pow(2, i)); ans = start * Math.pow(2, 4); }
    else { seq = Array.from({ length: 4 }, (_, i) => start + i * i); ans = start + 16; }
    setSequence(seq); setAnswer(ans);
    const opts = [ans];
    while (opts.length < 4) { const w = ans + Math.floor(Math.random() * 10) - 5; if (w !== ans && !opts.includes(w)) opts.push(w); }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">What comes next?</p>
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-3xl font-bold text-foreground">{sequence.join(', ')}, <span className="text-primary">?</span></p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <button key={i} onClick={() => { if (opt === answer) setScore(s => s + 10); generate(); }} className="rounded-xl border border-border bg-card p-4 text-xl font-bold text-foreground hover:border-primary/30 active:scale-95">{opt}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── LOGIC SWITCH (toggle all lights) ─── */
function LogicSwitchGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [grid, setGrid] = useState<boolean[]>([]);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const initGrid = useCallback(() => {
    const g = Array(9).fill(false);
    const flips = level + 2;
    for (let i = 0; i < flips; i++) {
      const idx = Math.floor(Math.random() * 9);
      g[idx] = !g[idx];
      [idx - 3, idx + 3, idx % 3 > 0 ? idx - 1 : -1, idx % 3 < 2 ? idx + 1 : -1].forEach(n => { if (n >= 0 && n < 9) g[n] = !g[n]; });
    }
    setGrid(g); setMoves(0);
  }, [level]);

  useEffect(() => { initGrid(); }, [initGrid]);

  const toggle = (idx: number) => {
    const g = [...grid];
    g[idx] = !g[idx];
    [idx - 3, idx + 3, idx % 3 > 0 ? idx - 1 : -1, idx % 3 < 2 ? idx + 1 : -1].forEach(n => { if (n >= 0 && n < 9) g[n] = !g[n]; });
    setGrid(g); setMoves(m => m + 1);
    if (g.every(v => !v)) {
      const pts = Math.max(5, 50 - moves * 3) * level;
      setScore(s => {
        const newS = s + pts;
        if (level >= 5) { onFinish(newS); }
        else { setTimeout(() => setLevel(l => l + 1), 500); }
        return newS;
      });
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Level {level}/5</span><span className="text-muted-foreground">Score: {score} | Moves: {moves}</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Turn off all the lights!</p>
      <div className="mx-auto grid w-64 grid-cols-3 gap-3">
        {grid.map((on, i) => (
          <button key={i} onClick={() => toggle(i)} className={`h-20 rounded-xl border transition-all active:scale-95 ${on ? 'border-primary bg-primary/40' : 'border-border bg-card'}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── SHAPE MATCHING ─── */
function ShapeMatchingGame({ onFinish }: { onFinish: (s: number) => void }) {
  const shapes = ['⬛', '⬜', '🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [target, setTarget] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);

  const generate = useCallback(() => {
    const t = shapes[Math.floor(Math.random() * shapes.length)];
    setTarget(t);
    const idx = Math.floor(Math.random() * 6);
    const opts = Array.from({ length: 6 }, (_, i) => i === idx ? t : shapes.filter(s => s !== t)[Math.floor(Math.random() * (shapes.length - 1))]);
    setOptions(opts); setCorrectIdx(idx);
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">Find the matching shape:</p>
      <div className="mb-6 text-6xl">{target}</div>
      <div className="mx-auto grid w-64 grid-cols-3 gap-3">
        {options.map((s, i) => (
          <button key={i} onClick={() => { if (i === correctIdx) setScore(sc => sc + 1); generate(); }} className="h-16 rounded-xl border border-border bg-card text-3xl transition-all hover:border-primary/30 active:scale-95">{s}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── TRIVIA QUIZ ─── */
function TriviaGame({ onFinish }: { onFinish: (s: number) => void }) {
  const questions = [
    { q: 'What planet is closest to the Sun?', opts: ['Venus', 'Mercury', 'Mars', 'Earth'], correct: 1 },
    { q: 'What is the largest ocean?', opts: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2 },
    { q: 'How many continents are there?', opts: ['5', '6', '7', '8'], correct: 2 },
    { q: 'What gas do plants absorb?', opts: ['Oxygen', 'Nitrogen', 'CO2', 'Helium'], correct: 2 },
    { q: 'What is H2O?', opts: ['Salt', 'Water', 'Sugar', 'Oil'], correct: 1 },
    { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], correct: 1 },
    { q: 'What is the speed of light?', opts: ['300k km/s', '150k km/s', '1M km/s', '500k km/s'], correct: 0 },
    { q: 'Which element has symbol Fe?', opts: ['Iron', 'Gold', 'Silver', 'Lead'], correct: 0 },
    { q: 'What is the smallest prime number?', opts: ['1', '2', '3', '0'], correct: 1 },
    { q: 'What year did WW2 end?', opts: ['1944', '1945', '1946', '1943'], correct: 1 },
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffled] = useState(() => [...questions].sort(() => Math.random() - 0.5));

  const handleAnswer = (oi: number) => {
    if (oi === shuffled[idx].correct) setScore(s => s + 10);
    if (idx + 1 >= shuffled.length) onFinish(score + (oi === shuffled[idx].correct ? 10 : 0));
    else setIdx(i => i + 1);
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className="text-muted-foreground">{idx + 1}/{shuffled.length}</span>
      </div>
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-xl font-bold text-foreground">{shuffled[idx].q}</p>
      </div>
      <div className="grid gap-3">
        {shuffled[idx].opts.map((o, i) => (
          <button key={i} onClick={() => handleAnswer(i)} className="rounded-xl border border-border bg-card p-3 text-foreground font-semibold hover:border-primary/30 active:scale-98">{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── QUICK DECISION ─── */
function QuickDecisionGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [numbers, setNumbers] = useState<[number, number]>([0, 0]);
  const [question, setQuestion] = useState<'bigger' | 'smaller'>('bigger');

  const generate = useCallback(() => {
    const a = Math.floor(Math.random() * 100); let b = Math.floor(Math.random() * 100);
    while (b === a) b = Math.floor(Math.random() * 100);
    setNumbers([a, b]);
    setQuestion(Math.random() > 0.5 ? 'bigger' : 'smaller');
  }, []);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => {
    if (timeLeft <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onFinish]);

  const pick = (idx: number) => {
    const correct = question === 'bigger' ? (numbers[idx] > numbers[1 - idx]) : (numbers[idx] < numbers[1 - idx]);
    if (correct) setScore(s => s + 1);
    generate();
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}><Timer className="h-4 w-4" /> {timeLeft}s</span>
      </div>
      <p className="mb-6 text-lg font-semibold text-foreground">Pick the <span className="text-primary">{question}</span> number!</p>
      <div className="flex gap-4 justify-center">
        {numbers.map((n, i) => (
          <button key={i} onClick={() => pick(i)} className="h-32 w-32 rounded-xl border border-border bg-card text-4xl font-bold text-foreground hover:border-primary/30 active:scale-95">{n}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── MAZE GAME ─── */
function MazeGame({ onFinish }: { onFinish: (s: number) => void }) {
  const size = 7;
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const goal = { x: size - 1, y: size - 1 };

  const generateMaze = useCallback(() => {
    const w = new Set<string>();
    const wallCount = 8 + level * 2;
    for (let i = 0; i < wallCount; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if ((x === 0 && y === 0) || (x === size - 1 && y === size - 1)) continue;
      w.add(`${x},${y}`);
    }
    setWalls(w);
    setPlayerPos({ x: 0, y: 0 });
    setMoves(0);
  }, [level]);

  useEffect(() => { generateMaze(); }, [generateMaze]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      let { x, y } = playerPos;
      if (e.key === 'ArrowUp' || e.key === 'w') y = Math.max(0, y - 1);
      else if (e.key === 'ArrowDown' || e.key === 's') y = Math.min(size - 1, y + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'a') x = Math.max(0, x - 1);
      else if (e.key === 'ArrowRight' || e.key === 'd') x = Math.min(size - 1, x + 1);
      else return;
      if (walls.has(`${x},${y}`)) return;
      setPlayerPos({ x, y });
      setMoves(m => m + 1);
      if (x === goal.x && y === goal.y) {
        const pts = Math.max(10, 100 - moves * 2) * level;
        setScore(s => {
          const ns = s + pts;
          if (level >= 3) onFinish(ns);
          else setTimeout(() => setLevel(l => l + 1), 300);
          return ns;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, walls, level, moves, score, onFinish]);

  const movePlayer = (dx: number, dy: number) => {
    const x = Math.max(0, Math.min(size - 1, playerPos.x + dx));
    const y = Math.max(0, Math.min(size - 1, playerPos.y + dy));
    if (walls.has(`${x},${y}`)) return;
    setPlayerPos({ x, y }); setMoves(m => m + 1);
    if (x === goal.x && y === goal.y) {
      const pts = Math.max(10, 100 - moves * 2) * level;
      setScore(s => { const ns = s + pts; if (level >= 3) onFinish(ns); else setTimeout(() => setLevel(l => l + 1), 300); return ns; });
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Level {level}/3</span><span className="text-muted-foreground">Moves: {moves} | Score: {score}</span>
      </div>
      <div className="mx-auto mb-4 inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }).map((_, i) => {
          const x = i % size, y = Math.floor(i / size);
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const isGoal = x === goal.x && y === goal.y;
          const isWall = walls.has(`${x},${y}`);
          return (
            <div key={i} className={`h-8 w-8 sm:h-10 sm:w-10 rounded-md border text-sm flex items-center justify-center ${isPlayer ? 'bg-primary text-primary-foreground' : isGoal ? 'bg-green-500/30 border-green-500' : isWall ? 'bg-muted-foreground/30 border-muted' : 'bg-card border-border'}`}>
              {isPlayer ? '🏃' : isGoal ? '🏁' : isWall ? '🧱' : ''}
            </div>
          );
        })}
      </div>
      <div className="mx-auto grid w-36 grid-cols-3 gap-1">
        <div /><button onClick={() => movePlayer(0, -1)} className="rounded bg-muted p-2 font-bold text-foreground">↑</button><div />
        <button onClick={() => movePlayer(-1, 0)} className="rounded bg-muted p-2 font-bold text-foreground">←</button>
        <div />
        <button onClick={() => movePlayer(1, 0)} className="rounded bg-muted p-2 font-bold text-foreground">→</button>
        <div /><button onClick={() => movePlayer(0, 1)} className="rounded bg-muted p-2 font-bold text-foreground">↓</button><div />
      </div>
    </div>
  );
}

/* ─── COLOR MEMORY (simon says style) ─── */
function ColorMemoryGame({ onFinish }: { onFinish: (s: number) => void }) {
  const colorOptions = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const addToSequence = useCallback(() => {
    const newSeq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSeq); setPlayerSeq([]); setShowing(true);
    newSeq.forEach((c, i) => { setTimeout(() => setActiveColor(c), i * 600 + 200); setTimeout(() => setActiveColor(null), i * 600 + 500); });
    setTimeout(() => setShowing(false), newSeq.length * 600 + 400);
  }, [sequence]);

  useEffect(() => { addToSequence(); }, []);

  const handleClick = (idx: number) => {
    if (showing) return;
    const newP = [...playerSeq, idx];
    setPlayerSeq(newP);
    setActiveColor(idx); setTimeout(() => setActiveColor(null), 200);
    if (newP[newP.length - 1] !== sequence[newP.length - 1]) { onFinish(score); return; }
    if (newP.length === sequence.length) {
      setScore(s => s + sequence.length * 5);
      setTimeout(() => addToSequence(), 500);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Round {sequence.length}</span><span className="text-muted-foreground">Score: {score}</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{showing ? 'Watch...' : 'Repeat!'}</p>
      <div className="mx-auto grid w-52 grid-cols-2 gap-3">
        {colorOptions.map((c, i) => (
          <button key={i} onClick={() => handleClick(i)} disabled={showing}
            className={`h-24 rounded-xl border-2 transition-all ${c} ${activeColor === i ? 'scale-110 border-white opacity-100' : 'opacity-60 border-transparent'} hover:opacity-80`} />
        ))}
      </div>
    </div>
  );
}

/* ─── STRATEGY PUZZLE (Tic Tac Toe against simple AI) ─── */
function StrategyPuzzleGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b2, c] of lines) { if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a]; }
    return b.every(c => c) ? 'draw' : null;
  };

  const aiMove = useCallback((b: (string | null)[]) => {
    const empty = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
    if (empty.length === 0) return;
    // Simple AI: try to win, block, or random
    for (const mark of ['O', 'X']) {
      for (const i of empty) {
        const test = [...b]; test[i] = mark;
        if (checkWinner(test) === mark) { const nb = [...b]; nb[i] = 'O'; setBoard(nb); setIsPlayerTurn(true); handleEnd(nb); return; }
      }
    }
    const idx = empty[Math.floor(Math.random() * empty.length)];
    const nb = [...b]; nb[idx] = 'O'; setBoard(nb); setIsPlayerTurn(true); handleEnd(nb);
  }, []);

  const handleEnd = (b: (string | null)[]) => {
    const w = checkWinner(b);
    if (w) {
      setTimeout(() => {
        setGamesPlayed(p => p + 1);
        if (w === 'X') setGamesWon(g => g + 1);
        if (gamesPlayed + 1 >= 3) onFinish(gamesWon * 30 + (w === 'X' ? 30 : 0));
        else { setBoard(Array(9).fill(null)); setIsPlayerTurn(true); }
      }, 500);
    }
  };

  const handleClick = (idx: number) => {
    if (!isPlayerTurn || board[idx]) return;
    const nb = [...board]; nb[idx] = 'X'; setBoard(nb); setIsPlayerTurn(false);
    const w = checkWinner(nb);
    if (w) { handleEnd(nb); return; }
    setTimeout(() => aiMove(nb), 300);
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Won: {gamesWon}</span><span className="text-muted-foreground">Game {gamesPlayed + 1}/3</span>
      </div>
      <div className="mx-auto grid w-52 grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)} className="h-16 rounded-xl border border-border bg-card text-2xl font-bold text-foreground hover:border-primary/30">
            {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{isPlayerTurn ? 'Your turn (X)' : 'AI thinking...'}</p>
    </div>
  );
}

/* ─── BALANCE GAME (balance equation) ─── */
function BalanceGame({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [left, setLeft] = useState(0);
  const [rightBase, setRightBase] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);

  const generate = useCallback(() => {
    const a = Math.floor(Math.random() * 30) + 5;
    const b = Math.floor(Math.random() * 20) + 1;
    const ans = a - b;
    setLeft(a); setRightBase(b); setAnswer(ans);
    const opts = [ans];
    while (opts.length < 4) { const w = ans + Math.floor(Math.random() * 10) - 5; if (w !== ans && w > 0 && !opts.includes(w)) opts.push(w); }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const handlePick = (v: number) => {
    if (v === answer) setScore(s => s + 10);
    if (round + 1 >= 10) onFinish(score + (v === answer ? 10 : 0));
    else { setRound(r => r + 1); generate(); }
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span><span className="text-muted-foreground">{round + 1}/10</span>
      </div>
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-2xl font-bold text-foreground">⚖️ {left} = {rightBase} + <span className="text-primary">?</span></p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o, i) => (
          <button key={i} onClick={() => handlePick(o)} className="rounded-xl border border-border bg-card p-4 text-xl font-bold text-foreground hover:border-primary/30 active:scale-95">{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── GAME COMPONENT MAPPING ─── */
function getGameComponent(gameId: string): React.ComponentType<{ onFinish: (s: number) => void }> | null {
  // Math variants
  const mathIds = ['math-speed', 'number-ninja', 'quick-calc', 'geometry-builder', 'math-runner', 'mental-math-sprint', 'calculation-marathon', 'number-grid'];
  if (mathIds.includes(gameId)) return (props) => <MathGame {...props} variant={gameId} />;

  // Memory match variants
  const memoryMatchIds = ['memory-match', 'hidden-object', 'memory-grid-master'];
  if (memoryMatchIds.includes(gameId)) return (props) => <MemoryMatchGame {...props} gridSize={gameId === 'memory-grid-master' ? 6 : 4} />;

  // Pattern memory / color memory
  if (gameId === 'pattern-memory') return PatternMemoryGame;
  if (['color-memory'].includes(gameId)) return ColorMemoryGame;

  // Reaction-based
  if (['reaction-speed', 'reaction-timing'].includes(gameId)) return ReactionSpeedGame;
  if (['brain-reflex', 'fast-thinking'].includes(gameId)) return BrainReflexGame;
  if (['reflex-click'].includes(gameId)) return ReflexClickGame;

  // Word games
  if (['word-builder', 'word-scramble', 'word-chain'].includes(gameId)) return WordGame;
  if (['speed-typing'].includes(gameId)) return SpeedTypingGame;
  if (['trivia-arena', 'trivia-master', 'knowledge-race', 'knowledge-duel'].includes(gameId)) return TriviaGame;
  if (['word-search'].includes(gameId)) return WordGame;

  // Pattern / logic
  if (['pattern-recognition', 'hidden-pattern', 'pattern-speed', 'pattern-builder'].includes(gameId)) return PatternRecognitionGame;
  if (['logic-sequence', 'logic-puzzle'].includes(gameId)) return SequenceGame;
  if (['logic-switch', 'logic-tower'].includes(gameId)) return LogicSwitchGame;
  if (['brain-rotation'].includes(gameId)) return PatternRecognitionGame;

  // Strategy
  if (['strategy-puzzle', 'strategy-board', 'smart-strategy'].includes(gameId)) return StrategyPuzzleGame;
  if (['shape-matching'].includes(gameId)) return ShapeMatchingGame;
  if (['brain-balance'].includes(gameId)) return BalanceGame;
  if (['quick-decision'].includes(gameId)) return QuickDecisionGame;

  // Maze
  if (['brain-maze', 'maze-escape', 'puzzle-labyrinth'].includes(gameId)) return MazeGame;

  // Puzzle/code breaker/sudoku - use sequence game or logic switch as fallback
  if (['code-breaker', 'puzzle-solver', 'puzzle-master', 'puzzle-blocks', 'time-attack', 'pattern-finder'].includes(gameId)) return LogicSwitchGame;
  if (['sudoku'].includes(gameId)) return SequenceGame;
  if (['strategy-tower'].includes(gameId)) return BalanceGame;

  return null;
}

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addXp, authUser } = useApp();
  const game = miniGames.find(g => g.id === id);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [ownership, setOwnership] = useState<'checking' | 'owned' | 'denied'>('checking');

  useEffect(() => {
    if (!authUser || !id) return;
    if (id === 'chess') { setOwnership('owned'); return; }
    supabase
      .from('purchased_games')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('game_id', id)
      .maybeSingle()
      .then(({ data }) => setOwnership(data ? 'owned' : 'denied'));
  }, [authUser, id]);

  if (!authUser) return <Navigate to="/auth" replace />;
  if (!game) return <div className="flex min-h-screen items-center justify-center text-foreground">Game not found</div>;

  // Chess redirect
  if (game.id === 'chess') { navigate('/chess'); return null; }

  if (ownership === 'checking') {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (ownership === 'denied') return <Navigate to="/store" replace />;

  const handleFinish = async (score: number) => {
    setFinalScore(score);
    // Reduced XP for games (max 15 XP per game)
    const xpEarned = Math.min(15, Math.round(score * 0.5));
    if (xpEarned > 0) await addXp(xpEarned);
  };

  const GameComponent = getGameComponent(game.id);

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
            <p className="mb-6 text-sm text-primary font-semibold">+{Math.min(15, Math.round(finalScore * 0.5))} XP earned!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setFinalScore(null); setGameKey(k => k + 1); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground">
                <RotateCcw className="h-4 w-4" /> Replay
              </button>
              <button onClick={() => navigate('/store')} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Back to Store</button>
            </div>
          </motion.div>
        ) : GameComponent ? (
          <GameComponent key={gameKey} onFinish={handleFinish} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">This game is coming soon! 🚧</p>
            <button onClick={() => navigate('/store')} className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Back to Store</button>
          </div>
        )}
      </div>
    </div>
  );
}
