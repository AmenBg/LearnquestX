import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function LearningPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { language, profile, authUser, addXp } = useApp();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const subject = subjects.find(s => s.id === subjectId);

  useEffect(() => {
    generateExercises();
  }, [subjectId]);

  const generateExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: {
          subject: subject?.name || subjectId,
          country: profile?.country || 'US',
          educationLevel: profile?.education_level || 'middle_school',
          grade: profile?.grade || '7',
          term: profile?.current_term || 'term_1',
          language: language,
          count: 5,
        },
      });

      if (error) throw error;
      if (data?.questions && Array.isArray(data.questions)) {
        // Client-side validation: ensure correct index is valid
        const validated = data.questions.filter((q: GeneratedQuestion) =>
          q.options?.length === 4 &&
          typeof q.correct === 'number' &&
          q.correct >= 0 && q.correct <= 3 &&
          q.options[q.correct]?.trim() !== ''
        );
        setQuestions(validated.length > 0 ? validated : getFallbackQuestions(subject?.name || 'Math'));
      } else {
        setQuestions(getFallbackQuestions(subject?.name || 'Math'));
      }
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setQuestions(getFallbackQuestions(subject?.name || 'Math'));
    }
    setLoading(false);
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if (idx === questions[stepIndex].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex(i => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      const xpEarned = score * 25;
      if (xpEarned > 0 && authUser) {
        await addXp(xpEarned);

        // Save to exercise history
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await supabase.from('exercise_history').insert({
            user_id: authUser.id,
            subject_id: subjectId || 'unknown',
            lesson_id: `lesson_${Date.now()}`,
            question_hash: btoa(q.question).slice(0, 32),
            was_correct: i < score, // only first `score` questions were correct
            xp_earned: i < score ? 25 : 0,
          });
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
            <p className="text-sm text-muted-foreground">AI is creating unique questions for you</p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const xpEarned = score * 25;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="mb-6 text-7xl">🏆</div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">{t('learning.complete', language)}</h1>
            <p className="mb-6 text-muted-foreground">{subject?.name}</p>
            <div className="mb-8 flex items-center justify-center gap-6">
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center">
                <p className="text-2xl font-bold text-primary">{score}/{questions.length}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center glow-primary">
                <p className="text-2xl font-bold text-primary">+{xpEarned} XP</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setCompleted(false); setStepIndex(0); setScore(0); setSelectedOption(null); setAnswered(false); generateExercises(); }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground"
              >
                🔄 New Exercises
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{subject?.name} {subject?.icon}</span>
            <span className="text-muted-foreground">{stepIndex + 1}/{questions.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-xp" animate={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Score: {score}/{stepIndex + (answered ? 1 : 0)}</span>
            <span className="flex items-center gap-1 text-primary"><Zap className="h-3 w-3" /> +{score * 25} XP</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {stepIndex === questions.length - 1 ? '🏆 Challenge' : '❓ Quiz'}
            </div>
            <h2 className="mb-6 text-lg font-bold text-foreground">{step.question}</h2>
            <div className="mb-6 grid gap-3">
              {step.options.map((opt, idx) => {
                let optionClass = 'border-border bg-muted/50 hover:border-primary/30 cursor-pointer';
                if (answered) {
                  if (idx === step.correct) optionClass = 'border-primary bg-primary/10';
                  else if (idx === selectedOption) optionClass = 'border-destructive bg-destructive/10';
                  else optionClass = 'border-border bg-muted/30 opacity-50';
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium text-foreground transition-all ${optionClass}`}
                  >
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

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`mb-4 rounded-lg p-3 text-sm ${
                  selectedOption === step.correct ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                }`}>
                  {selectedOption === step.correct ? '✅ ' + t('learning.correct', language) : '❌ ' + t('learning.wrong', language)}
                  {' '}{step.explanation}
                </div>
                <button onClick={handleNext} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
                  {t('learning.next', language)} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFallbackQuestions(subject: string): GeneratedQuestion[] {
  return [
    { question: `What is 15 + 27?`, options: ['42', '41', '43', '40'], correct: 0, explanation: '15 + 27 = 42' },
    { question: `What is 8 × 7?`, options: ['54', '56', '58', '48'], correct: 1, explanation: '8 × 7 = 56' },
    { question: `What is 100 - 37?`, options: ['63', '67', '73', '57'], correct: 0, explanation: '100 - 37 = 63' },
    { question: `What is 144 ÷ 12?`, options: ['11', '12', '13', '14'], correct: 1, explanation: '144 ÷ 12 = 12' },
    { question: `🏆 What is 25² ?`, options: ['525', '625', '725', '425'], correct: 1, explanation: '25 × 25 = 625' },
  ];
}
