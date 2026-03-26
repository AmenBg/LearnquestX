import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Zap, Trophy, Timer, ArrowRight, RotateCcw, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject?: string;
  difficulty?: string;
}

export default function QuizArenaPage() {
  const { profile, authUser, authLoading, addXp, refetchProfile } = useApp();
  const { checkAndUnlock } = useAchievements(authUser?.id);
  const [phase, setPhase] = useState<'lobby' | 'loading' | 'playing' | 'result'>('lobby');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTime, setTotalTime] = useState(0);
  const [fastAnswers, setFastAnswers] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ, selected]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;

  const startSession = async () => {
    setPhase('loading');
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setTimeLeft(15);
    setTotalTime(0);
    setFastAnswers(0);
    setSessionXp(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          subject: 'Mixed (Mathematics, Science, Arabic, French, General Knowledge, Logic)',
          country: profile?.country || 'TN',
          educationLevel: profile?.education_level || 'middle_school',
          grade: profile?.grade || '7',
          term: profile?.current_term || 'term_1',
          language: profile?.preferred_language || 'en',
          count: 10,
        },
      });

      if (error) throw error;
      const qs = data?.questions || [];
      if (qs.length === 0) throw new Error('No questions');

      // Tag with subjects and difficulty
      const subjects = ['Math', 'Science', 'Arabic', 'French', 'General Knowledge', 'Logic'];
      const difficulties = ['Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Hard', 'Expert', 'Expert'];
      const tagged = qs.map((q: Question, i: number) => ({
        ...q,
        subject: subjects[i % subjects.length],
        difficulty: difficulties[Math.min(i, difficulties.length - 1)],
      }));

      setQuestions(tagged);
      setPhase('playing');
      startTimeRef.current = Date.now();
    } catch (e) {
      console.error('Quiz Arena error:', e);
      toast.error('Failed to load questions. Using fallback.');
      // Fallback questions
      setQuestions(getFallbackQuestions());
      setPhase('playing');
      startTimeRef.current = Date.now();
    }
  };


  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);

    const q = questions[currentQ];
    const isCorrect = idx === q.correct;
    const answerTime = 15 - timeLeft;
    setTotalTime(prev => prev + answerTime);

    let xpGain = 0;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);

      // XP based on difficulty
      const diffXp: Record<string, number> = { Easy: 3, Medium: 5, Hard: 8, Expert: 12 };
      xpGain = diffXp[q.difficulty || 'Medium'] || 5;

      // Speed bonus
      if (answerTime <= 2) {
        xpGain += 3;
        setFastAnswers(prev => prev + 1);
      }

      // Streak bonus
      if (streak >= 4) xpGain += 2;

      setScore(prev => prev + xpGain);
      setSessionXp(prev => prev + xpGain);
    } else {
      setStreak(0);
    }

    // Auto advance
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        finishSession(isCorrect ? correctCount + 1 : correctCount, sessionXp + (isCorrect ? xpGain : 0));
      }
    }, 1500);
  };

  const finishSession = async (finalCorrect: number, finalXp: number) => {
    setPhase('result');
    if (finalXp > 0) {
      await addXp(finalXp);
      await refetchProfile();
    }

    const pct = (finalCorrect / questions.length) * 100;
    // Check achievements
    await checkAndUnlock([
      { id: 'first_arena', condition: true },
      { id: 'first_correct', condition: finalCorrect > 0 },
      { id: 'perfect_quiz', condition: pct === 100 },
      { id: 'fast_answer', condition: fastAnswers > 0 },
      { id: 'fast_5_row', condition: fastAnswers >= 5 },
    ]);
  };

  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/20 text-5xl">
              <Swords className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-3 text-4xl font-bold text-foreground">Quiz Arena</h1>
            <p className="mb-8 text-muted-foreground">Random questions from all subjects. Answer fast, earn XP!</p>

            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-muted-foreground">10 Questions</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-xs text-muted-foreground">15s per Q</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs text-muted-foreground">XP Rewards</div>
              </div>
            </div>

            <button onClick={startSession} className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95">
              Enter Arena
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = pct >= 60;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="text-6xl mb-4">{passed ? '🏆' : '💪'}</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{passed ? 'Arena Victory!' : 'Keep Practicing!'}</h2>
            <p className="text-muted-foreground mb-6">{passed ? 'You passed the challenge!' : 'You need 60% to pass. Try again!'}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold text-foreground">{correctCount}/{questions.length}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold text-primary">{pct}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold text-foreground">+{sessionXp}</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-bold text-foreground">{totalTime}s</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={startSession} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:scale-105 transition-all">
                <RotateCcw className="h-4 w-4" /> Play Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing
  const q = questions[currentQ];
  const progressPct = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Q{currentQ + 1}/{questions.length}</span>
            {q.subject && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{q.subject}</span>}
            {q.difficulty && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{q.difficulty}</span>}
          </div>
          <div className="flex items-center gap-3">
            {streak > 1 && <span className="text-sm font-bold text-streak">🔥 {streak}</span>}
            <span className="text-sm font-bold text-primary">⚡ +{sessionXp}</span>
          </div>
        </div>

        <Progress value={progressPct} className="mb-6 h-2" />

        {/* Timer */}
        <div className="mb-4 flex justify-center">
          <motion.div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              timeLeft <= 5 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
            }`}
            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Timer className="h-4 w-4" /> {timeLeft}s
          </motion.div>
        </div>

        {/* Question */}
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
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl border p-4 text-left text-sm font-medium text-foreground transition-all ${style}`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {selected !== null && q.explanation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                💡 {q.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFallbackQuestions(): Question[] {
  return [
    { question: 'What is 7 × 8?', options: ['54', '56', '64', '48'], correct: 1, explanation: '7 × 8 = 56', subject: 'Math', difficulty: 'Easy' },
    { question: 'What is the chemical formula for water?', options: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1, explanation: 'Water is H2O', subject: 'Science', difficulty: 'Easy' },
    { question: 'What is the capital of Tunisia?', options: ['Sfax', 'Sousse', 'Tunis', 'Bizerte'], correct: 2, explanation: 'Tunis is the capital of Tunisia', subject: 'General Knowledge', difficulty: 'Easy' },
    { question: 'Solve: 3x + 5 = 20', options: ['x = 3', 'x = 5', 'x = 7', 'x = 15'], correct: 1, explanation: '3x = 15, x = 5', subject: 'Math', difficulty: 'Medium' },
    { question: 'Which planet is closest to the sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correct: 2, explanation: 'Mercury is the closest', subject: 'Science', difficulty: 'Medium' },
    { question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correct: 1, explanation: '15% × 200 = 30', subject: 'Math', difficulty: 'Medium' },
    { question: 'What does DNA stand for?', options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Dynamic Nuclear Atom', 'Dense Natural Acid'], correct: 0, explanation: 'DNA = Deoxyribonucleic Acid', subject: 'Science', difficulty: 'Hard' },
    { question: 'If a = 3 and b = 4, what is a² + b²?', options: ['7', '12', '25', '49'], correct: 2, explanation: '9 + 16 = 25', subject: 'Math', difficulty: 'Hard' },
    { question: 'What year was Tunisia independence?', options: ['1954', '1956', '1960', '1962'], correct: 1, explanation: 'Tunisia gained independence in 1956', subject: 'General Knowledge', difficulty: 'Expert' },
    { question: 'What is the integral of 2x?', options: ['x', 'x²', 'x² + C', '2x² + C'], correct: 2, explanation: '∫2x dx = x² + C', subject: 'Math', difficulty: 'Expert' },
  ];
}
