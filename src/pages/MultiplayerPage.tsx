import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Users, Timer, Trophy, Loader2, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function MultiplayerPage() {
  const { profile, authUser, authLoading, addXp, refetchProfile } = useApp();
  const { checkAndUnlock } = useAchievements(authUser?.id);
  const [phase, setPhase] = useState<'lobby' | 'waiting' | 'playing' | 'result'>('lobby');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [matchType, setMatchType] = useState<'1v1' | 'group'>('1v1');

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser || !profile) return <Navigate to="/auth" />;

  const findMatch = async () => {
    setPhase('waiting');

    // Look for existing waiting match
    const { data: existing } = await supabase
      .from('quiz_matches')
      .select('*')
      .eq('status', 'waiting')
      .eq('match_type', matchType)
      .limit(1)
      .single();

    if (existing) {
      // Join existing match
      setMatchId(existing.id);
      await supabase.from('match_players').insert({
        match_id: existing.id,
        user_id: authUser.id,
        player_name: profile.name,
      });

      // Start the match
      await supabase.from('quiz_matches').update({
        status: 'active',
        started_at: new Date().toISOString(),
      }).eq('id', existing.id);

      // Generate questions
      await loadQuestions(existing.id);
    } else {
      // Create new match
      const { data: newMatch } = await supabase.from('quiz_matches').insert({
        match_type: matchType,
        max_players: matchType === '1v1' ? 2 : 5,
        question_data: [],
      }).select().single();

      if (newMatch) {
        setMatchId(newMatch.id);
        await supabase.from('match_players').insert({
          match_id: newMatch.id,
          user_id: authUser.id,
          player_name: profile.name,
        });

        // Subscribe to match updates
        subscribeToMatch(newMatch.id);
      }
    }
  };

  const loadQuestions = async (mId: string) => {
    try {
      const { data } = await supabase.functions.invoke('generate-exercises', {
        body: {
          subject: 'Mixed (Math, Science, General Knowledge)',
          country: profile?.country || 'TN',
          educationLevel: profile?.education_level || 'middle_school',
          grade: profile?.grade || '7',
          term: profile?.current_term || 'term_1',
          language: profile?.preferred_language || 'en',
          count: 6,
        },
      });
      const qs = data?.questions || getFallback();
      setQuestions(qs);

      // Store questions in match
      await supabase.from('quiz_matches').update({ question_data: qs }).eq('id', mId);
    } catch {
      setQuestions(getFallback());
    }

    // Get opponent name
    const { data: players } = await supabase
      .from('match_players')
      .select('player_name, user_id')
      .eq('match_id', mId);
    const opp = players?.find(p => p.user_id !== authUser!.id);
    if (opp) setOpponentName(opp.player_name);

    setPhase('playing');
  };

  const subscribeToMatch = (mId: string) => {
    const channel = supabase
      .channel(`match-${mId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quiz_matches',
        filter: `id=eq.${mId}`,
      }, async (payload: any) => {
        if (payload.new.status === 'active') {
          // Match started!
          await loadQuestions(mId);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_players',
        filter: `match_id=eq.${mId}`,
      }, (payload: any) => {
        const p = payload.new;
        if (p && p.user_id !== authUser!.id) {
          setOpponentScore(p.score || 0);
          setOpponentName(p.player_name || 'Opponent');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return 15; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, currentQ, selected]);

  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[currentQ];
    const isCorrect = idx === q.correct;

    if (isCorrect) setMyScore(prev => prev + 1);

    // Update score in DB
    if (matchId) {
      await supabase.from('match_players')
        .update({ score: isCorrect ? myScore + 1 : myScore })
        .eq('match_id', matchId)
        .eq('user_id', authUser!.id);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        finishMatch(isCorrect ? myScore + 1 : myScore);
      }
    }, 1500);
  };

  const finishMatch = async (finalScore: number) => {
    setPhase('result');
    const xp = finalScore * 5;
    if (xp > 0) { await addXp(xp); await refetchProfile(); }

    if (matchId) {
      await supabase.from('match_players')
        .update({ score: finalScore, finished: true })
        .eq('match_id', matchId)
        .eq('user_id', authUser!.id);
    }

    const won = finalScore > opponentScore;
    await checkAndUnlock([
      { id: 'first_mp_win', condition: won },
    ]);
  };

  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Users className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Multiplayer Battle</h1>
            <p className="text-muted-foreground">Challenge real players in live quiz matches!</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <button onClick={() => { setMatchType('1v1'); findMatch(); }}
              className="rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:scale-[1.02]"
            >
              <Swords className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-lg font-bold text-foreground">1 vs 1</h3>
              <p className="text-sm text-muted-foreground">Head-to-head quiz battle</p>
            </button>
            <button onClick={() => { setMatchType('group'); findMatch(); }}
              className="rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:scale-[1.02]"
            >
              <Users className="h-10 w-10 text-secondary mb-3" />
              <h3 className="text-lg font-bold text-foreground">Group Battle</h3>
              <p className="text-sm text-muted-foreground">Up to 5 players compete</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold text-foreground">Finding opponent...</h2>
          <p className="text-sm text-muted-foreground">Waiting for players to join</p>
          <button onClick={() => { setPhase('lobby'); setMatchId(null); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const won = myScore > opponentScore;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="text-6xl mb-4">{won ? '🏆' : myScore === opponentScore ? '🤝' : '😤'}</div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{won ? 'Victory!' : myScore === opponentScore ? 'Draw!' : 'Defeat!'}</h2>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{myScore}</div>
                <div className="text-sm text-muted-foreground">You</div>
              </div>
              <div className="text-2xl text-muted-foreground">vs</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{opponentScore}</div>
                <div className="text-sm text-muted-foreground">{opponentName || 'Opponent'}</div>
              </div>
            </div>

            <p className="text-sm text-primary mb-6">+{myScore * 5} XP earned</p>

            <button onClick={() => { setPhase('lobby'); setMatchId(null); setCurrentQ(0); setMyScore(0); setOpponentScore(0); setSelected(null); }}
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:scale-105 transition-all"
            >
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
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{myScore}</div>
            <div className="text-xs text-muted-foreground">You</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Q{currentQ + 1}/{questions.length}</span>
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${timeLeft <= 5 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'}`}>
              <Timer className="h-3 w-3" /> {timeLeft}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{opponentScore}</div>
            <div className="text-xs text-muted-foreground">{opponentName || '...'}</div>
          </div>
        </div>

        <Progress value={((currentQ + 1) / questions.length) * 100} className="mb-6 h-2" />

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
    { question: 'What is 9 × 9?', options: ['72', '81', '90', '63'], correct: 1, explanation: '9 × 9 = 81' },
    { question: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, explanation: 'Pacific is the largest' },
    { question: 'Solve: x + 7 = 15', options: ['x = 6', 'x = 7', 'x = 8', 'x = 9'], correct: 2, explanation: 'x = 15 - 7 = 8' },
    { question: 'What is H2O?', options: ['Hydrogen', 'Oxygen', 'Water', 'Salt'], correct: 2, explanation: 'H2O is water' },
    { question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correct: 1, explanation: 'A hexagon has 6 sides' },
    { question: 'What is the speed of light?', options: ['300 km/s', '3000 km/s', '300,000 km/s', '3,000,000 km/s'], correct: 2, explanation: '~300,000 km/s' },
  ];
}
