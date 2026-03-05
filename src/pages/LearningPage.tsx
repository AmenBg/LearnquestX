import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleLesson } from '@/lib/gameData';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, ArrowRight, Trophy, Zap } from 'lucide-react';

export default function LearningPage() {
  const { language } = useApp();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const step = sampleLesson.steps[stepIndex];
  const totalSteps = sampleLesson.steps.length;

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if ('correct' in step && idx === step.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(i => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const xpEarned = score * 25;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="mb-6 text-7xl">🏆</div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">{t('learning.complete', language)}</h1>
            <p className="mb-6 text-muted-foreground">{sampleLesson.title}</p>
            <div className="mb-8 flex items-center justify-center gap-6">
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center">
                <p className="text-2xl font-bold text-primary">{score}/{totalSteps - 1}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-6 py-4 text-center glow-primary">
                <p className="text-2xl font-bold text-primary">+{xpEarned} XP</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{sampleLesson.title}</span>
            <span className="text-muted-foreground">{stepIndex + 1}/{totalSteps}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-xp"
              animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            {step.type === 'explanation' ? (
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary">
                  📖 Lesson
                </div>
                <h2 className="mb-4 text-xl font-bold text-foreground">{step.title}</h2>
                <p className="mb-6 text-muted-foreground leading-relaxed">{step.content}</p>
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                  {t('learning.next', language)} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {step.type === 'challenge' ? '🏆 Challenge' : '❓ Quiz'}
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
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answered}
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
                      selectedOption === step.correct
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {selectedOption === step.correct ? '✅ ' + t('learning.correct', language) : '❌ ' + t('learning.wrong', language)}
                      {' '}{step.explanation}
                    </div>
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
                    >
                      {t('learning.next', language)} <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
