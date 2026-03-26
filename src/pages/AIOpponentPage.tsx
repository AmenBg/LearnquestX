import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Bot, Timer, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const AI_DIFFICULTIES = [
  { id: 'easy', name: 'Easy Bot', emoji: '🤖', accuracy: 0.4, minTime: 3, maxTime: 8, color: 'text-green-400' },
  { id: 'medium', name: 'Smart Bot', emoji: '🧠', accuracy: 0.65, minTime: 2, maxTime: 6, color: 'text-secondary' },
  { id: 'hard', name: 'Expert Bot', emoji: '⚡', accuracy: 0.85, minTime: 1, maxTime: 4, color: 'text-accent' },
  { id: 'expert', name: 'Master Bot', emoji: '👑', accuracy: 0.95, minTime: 0.5, maxTime: 3, color: 'text-destructive' },
];

export default function AIOpponentPage() {
  const { profile, authUser, authLoading, addXp, refetchProfile } = useApp();
  const { checkAndUnlock } = useAchievements(authUser?.id);
  const [phase, setPhase] = useState<'select' | 'loading' | 'playing' | 'result'>('select');
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTIES[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiAnswer, setAiAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout>();

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return 15; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ, selected]);

  // AI answer simulation
  useEffect(() => {
    if (phase !== 'playing' || selected !== null || questions.length === 0) return;
    const q = questions[currentQ];
    const delay = (difficulty.minTime + Math.random() * (difficulty.maxTime - difficulty.minTime)) * 1000;
    const correct = Math.random() < difficulty.accuracy;
    const aiIdx = correct ? q.correct : [0, 1, 2, 3].filter(i => i !== q.correct)[Math.floor(Math.random() * 3)];

    const timeout = setTimeout(() => {
      if (selected === null) {
        setAiAnswer(aiIdx);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [phase, currentQ, selected, questions]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;

  const startGame = async (diff: typeof AI_DIFFICULTIES[0]) => {
    setDifficulty(diff);
    setPhase('loading');
    setCurrentQ(0);
    setSelected(null);
    setPlayerScore(0);
    setAiScore(0);
    setAiAnswer(null);
    setTimeLeft(15);

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          subject: 'Mixed (Mathematics, Science, General Knowledge, Logic)',
          country: profile?.country || 'TN',
          educationLevel: profile?.education_level || 'middle_school',
          grade: profile?.grade || '7',
          term: profile?.current_term || 'term_1',
          language: profile?.preferred_language || 'en',
          count: 8,
        },
      });
      if (error) throw error;
      setQuestions(data?.questions || getFallback());
    } catch {
      setQuestions(getFallback());
    }
    setPhase('playing');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);

    const q = questions[currentQ];
    const playerCorrect = idx === q.correct;
    const aiCorrect = aiAnswer !== null ? aiAnswer === q.correct : Math.random() < difficulty.accuracy;

    if (playerCorrect) setPlayerScore(prev => prev + 1);
    if (aiCorrect) setAiScore(prev => prev + (playerCorrect ? 0 : 1) + (aiAnswer !== null ? 1 : 0));
    // Simplified: just track AI as getting it right based on accuracy
    if (!aiAnswer) {
      const finalAiCorrect = Math.random() < difficulty.accuracy;
      if (finalAiCorrect) setAiScore(prev => prev + 1);
    } else if (aiAnswer === q.correct) {
      setAiScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setAiAnswer(null);
        setTimeLeft(15);
      } else {
        finishGame(playerCorrect ? playerScore + 1 : playerScore);
      }
    }, 1500);
  };

  const finishGame = async (finalScore: number) => {
    setPhase('result');
    const xp = Math.max(finalScore * 3, 0);
    if (xp > 0) {
      await addXp(xp);
      await refetchProfile();
    }
    const won = finalScore > aiScore;
    await checkAndUnlock([
      { id: 'ai_easy_win', condition: won && difficulty.id === 'easy' },
      { id: 'ai_expert_win', condition: won && difficulty.id === 'expert' },
    ]);
  };

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Bot className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Opponent</h1>
            <p className="text-muted-foreground">Challenge an AI bot in a quiz battle!</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {AI_DIFFICULTIES.map((d, i) => (
              <motion.button key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => startGame(d)}
                className="rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="text-4xl mb-3">{d.emoji}</div>
                <h3 className={`text-lg font-bold ${d.color}`}>{d.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Accuracy: ~{Math.round(d.accuracy * 100)}%</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Preparing battle against {difficulty.name}...</p>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const won = playerScore > aiScore;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="text-6xl mb-4">{won ? '🏆' : '😤'}</div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{won ? 'You Won!' : 'AI Wins!'}</h2>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{playerScore}</div>
                <div className="text-sm text-muted-foreground">You</div>
              </div>
              <div className="text-2xl text-muted-foreground">vs</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{aiScore}</div>
                <div className="text-sm text-muted-foreground">{difficulty.name}</div>
              </div>
            </div>

            <p className="text-sm text-primary mb-6">+{Math.max(playerScore * 3, 0)} XP earned</p>

            <button onClick={() => setPhase('select')} className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:scale-105 transition-all">
              Play Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        {/* Scoreboard */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{playerScore}</div>
            <div className="text-xs text-muted-foreground">You</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Q{currentQ + 1}/{questions.length}</span>
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${timeLeft <= 5 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'}`}>
              <Timer className="h-3 w-3" /> {timeLeft}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{aiScore}</div>
            <div className="text-xs text-muted-foreground">{difficulty.emoji}</div>
          </div>
        </div>

        <Progress value={((currentQ + 1) / questions.length) * 100} className="mb-6 h-2" />

        {aiAnswer !== null && selected === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 text-center text-sm text-muted-foreground">
            {difficulty.emoji} {difficulty.name} has answered!
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{q.question}</h2>
            </div>
            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                let style = 'border-border hover:border-primary/40 hover:bg-muted';
                if (selected !== null) {
                  if (i === q.correct) style = 'border-green-500 bg-green-500/10 text-green-400';
                  else if (i === selected) style = 'border-destructive bg-destructive/10 text-destructive';
                  else style = 'border-border opacity-50';
                }
                return (
                  <motion.button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl border p-4 text-left text-sm font-medium text-foreground transition-all ${style}`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFallback(): Question[] {
  return [
    { question: 'What is 12 × 12?', options: ['124', '144', '132', '156'], correct: 1, explanation: '12 × 12 = 144' },
    { question: 'Which gas do plants absorb?', options: ['O2', 'N2', 'CO2', 'H2'], correct: 2, explanation: 'Plants absorb CO2' },
    { question: 'What is the square root of 64?', options: ['6', '7', '8', '9'], correct: 2, explanation: '√64 = 8' },
    { question: 'What is the boiling point of water?', options: ['90°C', '100°C', '110°C', '120°C'], correct: 1, explanation: 'Water boils at 100°C' },
    { question: 'Solve: 2x = 14', options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'], correct: 2, explanation: 'x = 14/2 = 7' },
    { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, explanation: 'There are 7 continents' },
    { question: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correct: 1, explanation: '25% × 80 = 20' },
    { question: 'What planet is known as the Red Planet?', options: ['Jupiter', 'Mars', 'Venus', 'Saturn'], correct: 1, explanation: 'Mars is the Red Planet' },
  ];
}
