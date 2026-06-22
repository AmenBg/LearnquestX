import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, ArrowRight, Loader2, AlertTriangle, Pencil } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';
interface GeneratedQuestion {
  type: 'mcq' | 'written';
  question: string;
  options?: string[];
  correct?: number;
  accepted_answers?: string[];
  explanation: string;
  difficulty: Difficulty;
}

// Economy rebalance: easy -20%, medium -11%, hard unchanged, very_hard unchanged.
const DIFF_XP: Record<Difficulty, number> = { easy: 8, medium: 16, hard: 28, very_hard: 40 };
const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', very_hard: 'Very Hard' };
const PASS_THRESHOLD = 0.6;

export default function LearningPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { language, profile, authUser, addXp } = useApp();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenInput, setWrittenInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [difficultyTarget, setDifficultyTarget] = useState<'easy' | 'mixed' | 'hard'>('mixed');
  const sessionId = useRef(`session_${Date.now()}`);

  const isRandom = subjectId === 'random';
  const [actualSubjectId, setActualSubjectId] = useState<string>(subjectId || 'math');
  const subject = subjects.find(s => s.id === actualSubjectId);

  useEffect(() => {
    if (isRandom) {
      const r = subjects[Math.floor(Math.random() * subjects.length)];
      setActualSubjectId(r.id);
    } else {
      setActualSubjectId(subjectId || 'math');
    }
  }, [subjectId, isRandom]);

  useEffect(() => {
    if (actualSubjectId && authUser) generateExercises();
  }, [actualSubjectId, authUser?.id]);

  const computeDifficultyTarget = async (): Promise<'easy' | 'mixed' | 'hard'> => {
    if (!authUser) return 'mixed';
    const { data } = await supabase
      .from('exercise_history')
      .select('was_correct')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!data || data.length < 5) return 'mixed';
    const correct = data.filter(d => d.was_correct).length;
    const acc = correct / data.length;
    if (acc < 0.5) return 'easy';
    if (acc > 0.8) return 'hard';
    return 'mixed';
  };

  const fetchRecentQuestions = async (subj: string): Promise<string[]> => {
    if (!authUser) return [];
    const { data } = await supabase
      .from('exercise_history')
      .select('question_text')
      .eq('user_id', authUser.id)
      .eq('subject_id', subj)
      .order('created_at', { ascending: false })
      .limit(30);
    return (data || [])
      .map((d: any) => d.question_text)
      .filter((q: string | null): q is string => !!q);
  };

  const generateExercises = async () => {
    setLoading(true);
    setStepIndex(0);
    setSelectedOption(null);
    setWrittenInput('');
    setAnswered(false);
    setScore(0);
    setCompleted(false);
    setAnswers([]);
    sessionId.current = `session_${Date.now()}`;

    try {
      const subj = subjects.find(s => s.id === actualSubjectId);
      const [target, recent] = await Promise.all([
        computeDifficultyTarget(),
        fetchRecentQuestions(actualSubjectId),
      ]);
      setDifficultyTarget(target);

      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          subject: subj?.name || actualSubjectId,
          country: profile?.country || 'US',
          educationLevel: profile?.education_level || 'middle_school',
          grade: profile?.grade || '7',
          term: profile?.current_term || 'term_1',
          language,
          count: 5,
          difficultyTarget: target,
          writtenRatio: 0.2,
          recentQuestions: recent,
          variationSeed: Math.random().toString(36).slice(2, 10),
        },
      });

      if (error) throw error;
      const list: GeneratedQuestion[] = Array.isArray(data?.questions) ? data.questions : [];
      if (list.length >= 3) {
        setQuestions(list.slice(0, 5));
      } else {
        setQuestions(getFallbackQuestions());
      }
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setQuestions(getFallbackQuestions());
    }
    setLoading(false);
  };

  const checkWritten = (input: string, accepted: string[]): boolean => {
    const norm = (s: string) =>
      s.toLowerCase().trim().replace(/[.,!?;:"'`]/g, '').replace(/\s+/g, ' ').replace(/^(the|a|an)\s+/, '');
    const a = norm(input);
    if (!a) return false;
    return accepted.some(ans => {
      const b = norm(ans);
      if (a === b) return true;
      if (b.length >= 4 && (a.includes(b) || b.includes(a))) return true;
      // Levenshtein for typos
      return levenshtein(a, b) <= Math.max(1, Math.floor(b.length / 6));
    });
  };

  const submitAnswer = (mcqIdx?: number) => {
    if (answered) return;
    const q = questions[stepIndex];
    let correct = false;
    if (q.type === 'mcq' && typeof mcqIdx === 'number') {
      setSelectedOption(mcqIdx);
      correct = mcqIdx === q.correct;
    } else if (q.type === 'written') {
      if (!writtenInput.trim()) return;
      correct = checkWritten(writtenInput, q.accepted_answers || []);
    }
    setWasCorrect(correct);
    setAnswered(true);
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, correct]);
  };

  const handleNext = async () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex(i => i + 1);
      setSelectedOption(null);
      setWrittenInput('');
      setAnswered(false);
    } else {
      setCompleted(true);
      const passed = score / questions.length >= PASS_THRESHOLD;
      let totalXp = 0;
      for (let i = 0; i < answers.length; i++) {
        if (answers[i]) totalXp += DIFF_XP[questions[i].difficulty] || 18;
      }
      if (passed && totalXp > 0) totalXp += 25;

      if (totalXp > 0 && authUser) {
        await addXp(totalXp);
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const hash = safeHash(q.question);
          await supabase.from('exercise_history').insert({
            user_id: authUser.id,
            subject_id: actualSubjectId,
            lesson_id: sessionId.current,
            question_hash: hash,
            question_text: q.question.slice(0, 500),
            was_correct: answers[i] ?? false,
            xp_earned: answers[i] ? (DIFF_XP[q.difficulty] || 18) : 0,
          } as any);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-semibold text-foreground">Generating exercises...</p>
            <p className="text-sm text-muted-foreground">{subject?.icon} {subject?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const passed = score / questions.length >= PASS_THRESHOLD;
    let totalXp = 0;
    for (let i = 0; i < answers.length; i++) if (answers[i]) totalXp += DIFF_XP[questions[i].difficulty] || 18;
    if (passed && totalXp > 0) totalXp += 25;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
            <div className="mb-6 text-7xl">{passed ? '🏆' : '📖'}</div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {passed ? t('learning.complete', language) : 'Keep Practicing!'}
            </h1>
            <p className="mb-2 text-muted-foreground">{subject?.icon} {subject?.name}</p>

            {!passed && (
              <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" /> You need 60% to pass. Try again!
              </div>
            )}

            <div className="mb-8 flex items-center justify-center gap-6">
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center">
                <p className={`text-2xl font-bold ${passed ? 'text-primary' : 'text-destructive'}`}>{score}/{questions.length}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center glow-primary">
                <p className="text-2xl font-bold text-primary">+{totalXp} XP</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>

            <div className="mb-6 space-y-1">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={answers[i] ? 'text-primary' : 'text-destructive'}>
                    {answers[i] ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </span>
                  <span className="text-muted-foreground text-xs">{DIFF_LABEL[q.difficulty]}</span>
                  <span className="text-foreground truncate flex-1 text-left">{q.question}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => { if (isRandom) setActualSubjectId(subjects[Math.floor(Math.random() * subjects.length)].id); else generateExercises(); }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground">
                🔄 {isRandom ? 'New Subject' : 'Try Again'}
              </button>
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const step = questions[stepIndex];
  if (!step) return null;
  const targetBadge = difficultyTarget === 'easy' ? '🌱 Confidence mode' : difficultyTarget === 'hard' ? '🔥 Challenge mode' : '⚖️ Balanced';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <h1 className="sr-only">Practice Session — {subject?.name}</h1>
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{subject?.icon} {subject?.name}</span>
            <span className="text-xs text-muted-foreground">{targetBadge}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {stepIndex + 1}/{questions.length}</span>
            <span>Score: {score}/{stepIndex + (answered ? 1 : 0)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-xp" animate={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                ❓ {DIFF_LABEL[step.difficulty]}
              </span>
              {step.type === 'written' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  <Pencil className="h-3 w-3" /> Written answer
                </span>
              )}
            </div>
            <h2 className="mb-6 text-lg font-bold text-foreground">{step.question}</h2>

            {step.type === 'mcq' && step.options && (
              <div className="mb-6 grid gap-3">
                {step.options.map((opt, idx) => {
                  let cls = 'border-border bg-muted/50 hover:border-primary/30 cursor-pointer';
                  if (answered) {
                    if (idx === step.correct) cls = 'border-primary bg-primary/10';
                    else if (idx === selectedOption) cls = 'border-destructive bg-destructive/10';
                    else cls = 'border-border bg-muted/30 opacity-50';
                  }
                  return (
                    <button key={idx} onClick={() => submitAnswer(idx)} disabled={answered}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium text-foreground transition-all ${cls}`}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                      {answered && idx === step.correct && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                      {answered && idx === selectedOption && idx !== step.correct && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === 'written' && (
              <div className="mb-6">
                <input
                  type="text"
                  value={writtenInput}
                  onChange={e => setWrittenInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !answered) submitAnswer(); }}
                  disabled={answered}
                  placeholder="Type your answer…"
                  className={`w-full rounded-xl border p-4 text-base font-medium bg-muted/50 text-foreground outline-none transition-all ${
                    answered
                      ? wasCorrect
                        ? 'border-primary bg-primary/10'
                        : 'border-destructive bg-destructive/10'
                      : 'border-border focus:border-primary/50'
                  }`}
                  autoFocus
                />
                {!answered && (
                  <button onClick={() => submitAnswer()} disabled={!writtenInput.trim()}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                    Submit answer
                  </button>
                )}
                {answered && !wasCorrect && step.accepted_answers && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Accepted: <span className="text-foreground">{step.accepted_answers[0]}</span>
                  </p>
                )}
              </div>
            )}

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`mb-4 rounded-lg p-3 text-sm ${wasCorrect ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {wasCorrect ? '✅ ' + t('learning.correct', language) : '❌ ' + t('learning.wrong', language)} {step.explanation}
                </div>
                <button onClick={handleNext} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
                  {stepIndex < questions.length - 1 ? t('learning.next', language) : 'Finish'} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function safeHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 32);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
    }
  }
  return m[a.length][b.length];
}

function getFallbackQuestions(): GeneratedQuestion[] {
  return [
    { type: 'mcq', question: 'What is 15 + 27?', options: ['42', '41', '43', '40'], correct: 0, explanation: '15 + 27 = 42', difficulty: 'easy' },
    { type: 'mcq', question: 'What is 8 × 7?', options: ['54', '56', '58', '48'], correct: 1, explanation: '8 × 7 = 56', difficulty: 'medium' },
    { type: 'written', question: 'What is the capital of France?', accepted_answers: ['paris'], explanation: 'Paris is the capital of France.', difficulty: 'easy' },
    { type: 'mcq', question: 'What is 144 ÷ 12?', options: ['11', '12', '13', '14'], correct: 1, explanation: '144 ÷ 12 = 12', difficulty: 'hard' },
    { type: 'mcq', question: 'What is 25²?', options: ['525', '625', '725', '425'], correct: 1, explanation: '25 × 25 = 625', difficulty: 'very_hard' },
  ];
}
