import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import { useApp } from '@/contexts/AppContext';
import { getLanguage, getLessons, getLevel, CodeLesson } from '@/lib/codeLessons';
import { runCode, normalizeOutput } from '@/lib/codeRunner';
import {
  ArrowLeft, ArrowRight, Play, Lightbulb, BookOpen, Eye, CheckCircle2,
  XCircle, Lock, Trophy, Zap, Sparkles, Terminal, ListTree,
} from 'lucide-react';
import { toast } from 'sonner';
import { getLevelLabel } from '@/lib/codeLessons';

interface Progress {
  completed: number[];          // lesson indices completed
  current: number;              // active lesson index
  firstTry: Record<number, boolean>;
  streak: number;               // perfect-pass streak across lessons
}

function storageKey(userId: string | undefined, lang: string, level: string) {
  return `code_progress_v1:${userId || 'anon'}:${lang}:${level}`;
}

function loadProgress(key: string, startIndex: number): Progress {
  if (typeof window === 'undefined') return { completed: [], current: startIndex, firstTry: {}, streak: 0 };
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completed: [], current: startIndex, firstTry: {}, streak: 0 };
}

function saveProgress(key: string, p: Progress) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(p));
}

export default function CodeLessonPage() {
  const { lang: langId, level: levelId } = useParams<{ lang: string; level: string }>();
  const { authUser, authLoading, addXp, language } = useApp();

  const lang = getLanguage(langId || '');
  const level = getLevel(levelId || '');
  const lessons = useMemo(() => (langId ? getLessons(langId) : []), [langId]);

  const pkey = storageKey(authUser?.id, langId || '', levelId || '');
  const [progress, setProgress] = useState<Progress>(() => loadProgress(pkey, level?.startIndex ?? 0));
  const [lessonIdx, setLessonIdx] = useState<number>(progress.current);

  const lesson: CodeLesson | undefined = lessons[lessonIdx];

  const [code, setCode] = useState('');
  const [runOutput, setRunOutput] = useState<string>('');
  const [runError, setRunError] = useState<string>('');
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Reset per-lesson state when changing lesson
  useEffect(() => {
    if (!lesson) return;
    setCode(''); // ✨ editor always starts COMPLETELY empty
    setRunOutput('');
    setRunError('');
    setHintsShown(0);
    setSolutionShown(false);
    setTheoryOpen(false);
    setQuizOpen(false);
    setQuizAnswer(null);
    setPassed(progress.completed.includes(lesson.index));
    setAttemptCount(0);
    const next = { ...progress, current: lesson.index };
    setProgress(next);
    saveProgress(pkey, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonIdx]);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading…</div>;
  }
  if (!authUser) return <Navigate to="/auth" replace />;
  if (!lang || !level || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">Lesson not found.</div>
      </div>
    );
  }

  const minLockedIdx = level.startIndex;
  const maxUnlocked = Math.max(...progress.completed, minLockedIdx);
  const isLessonLocked = (i: number) => i < minLockedIdx || i > maxUnlocked + 1;

  const handleRun = () => {
    setAttemptCount(a => a + 1);
    const res = runCode(lang.id, code);
    setRunOutput(res.output);
    setRunError(res.error || '');
    const ok = normalizeOutput(res.output) === normalizeOutput(lesson.expectedOutput);
    if (ok) {
      toast.success('✅ Output matches!');
      if (!quizOpen) setQuizOpen(true);
    }
  };

  const handleCompleteLesson = async () => {
    if (passed) return;
    setPassed(true);

    // XP calculation
    let xp = Math.round(lesson.baseXp * level.xpMultiplier);
    const bonuses: string[] = [];
    if (attemptCount <= 1) { xp += 15; bonuses.push('First-try +15'); }
    if (hintsShown === 0 && !solutionShown) { xp += 10; bonuses.push('No-hints +10'); }
    if (quizAnswer === lesson.quiz.correct) { xp += 10; bonuses.push('Quiz +10'); }

    // Cap to 50 (DB trigger cap_xp_earned for related tables — but addXp RPC allows higher, max 500)
    if (authUser) {
      await addXp(xp);
    }

    const next: Progress = {
      ...progress,
      completed: [...new Set([...progress.completed, lesson.index])],
      current: lesson.index,
      firstTry: { ...progress.firstTry, [lesson.index]: attemptCount <= 1 },
      streak: progress.streak + 1,
    };
    setProgress(next);
    saveProgress(pkey, next);

    toast.success(`+${xp} XP earned!`, {
      description: bonuses.length ? bonuses.join(' • ') : 'Lesson complete',
      duration: 5000,
    });
  };

  const goToLesson = (i: number) => {
    if (isLessonLocked(i)) {
      toast.error('🔒 Locked — finish the previous lesson first.');
      return;
    }
    setLessonIdx(i);
  };

  const progressPct = Math.round((progress.completed.length / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Top header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/code/${lang.id}`} className="text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <span className="text-2xl shrink-0">{lang.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{lang.name}</span>
                  <span>•</span>
                  <span style={{ color: level.color }} className="font-semibold">{getLevelLabel(level.id, language)}</span>
                  <span>•</span>
                  <span>{lesson.difficulty}</span>
                </div>
                <h1 className="font-bold text-foreground truncate">{lesson.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSidebarOpen(s => !s)}
                className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary/40"
              >
                <ListTree className="h-3.5 w-3.5" /> Lessons
              </button>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {progress.completed.length}/{lessons.length} • {progressPct}%
              </div>
            </div>
          </div>
          <div className="h-1 bg-muted">
            <div className="h-full bg-gradient-xp transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 grid gap-4 lg:grid-cols-[260px_1fr_1fr] xl:grid-cols-[280px_1fr_1.1fr]">
          {/* Sidebar lesson list */}
          {sidebarOpen && (
            <aside className="hidden lg:block">
              <div className="rounded-xl border border-border bg-card p-3 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <h3 className="px-2 py-1 text-xs font-bold uppercase text-muted-foreground tracking-wider">Curriculum</h3>
                <ul className="space-y-1 mt-2">
                  {lessons.map(l => {
                    const locked = isLessonLocked(l.index);
                    const done = progress.completed.includes(l.index);
                    const active = l.index === lesson.index;
                    return (
                      <li key={l.index}>
                        <button
                          onClick={() => goToLesson(l.index)}
                          disabled={locked}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                            active ? 'bg-primary/15 text-primary font-semibold' :
                            locked ? 'text-muted-foreground/40 cursor-not-allowed' :
                            'text-foreground hover:bg-muted'
                          }`}
                        >
                          {locked ? <Lock className="h-3 w-3 shrink-0" /> :
                            done ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> :
                            <span className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />}
                          <span className="truncate">{l.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          )}

          {/* Left: challenge */}
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">CHALLENGE</span>
                <span className="text-xs text-muted-foreground">+{Math.round(lesson.baseXp * level.xpMultiplier)} XP</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{lesson.topic}</h2>
              <p className="text-sm text-foreground/90 leading-relaxed">{lesson.challenge}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setTheoryOpen(o => !o)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium hover:border-primary/40">
                  <BookOpen className="h-3.5 w-3.5" /> {theoryOpen ? 'Hide' : 'Show'} Theory
                </button>
                <button onClick={() => setHintsShown(h => Math.min(h + 1, lesson.hints.length))} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium hover:border-primary/40">
                  <Lightbulb className="h-3.5 w-3.5 text-accent" /> Hint ({hintsShown}/{lesson.hints.length})
                </button>
                <button onClick={() => setSolutionShown(s => !s)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium hover:border-primary/40">
                  <Eye className="h-3.5 w-3.5" /> {solutionShown ? 'Hide' : 'Reveal'} Solution
                </button>
              </div>
            </div>

            <AnimatePresence>
              {theoryOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-bold text-foreground mb-2">📖 Theory</h3>
                    <p className="text-sm text-foreground/85 leading-relaxed mb-3">{lesson.theory}</p>
                    {lesson.example && (
                      <>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Example:</p>
                        <pre className="rounded-lg bg-[#1e1e2e] text-[#f8f8f2] text-xs p-3 overflow-x-auto font-mono"><code>{lesson.example}</code></pre>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hintsShown > 0 && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <h4 className="text-xs font-bold uppercase text-accent mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" /> Hints
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/85">
                  {lesson.hints.slice(0, hintsShown).map((h, i) => <li key={i}>{h}</li>)}
                </ol>
              </div>
            )}

            {solutionShown && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Solution</h4>
                <pre className="rounded-lg bg-[#1e1e2e] text-[#f8f8f2] text-xs p-3 overflow-x-auto font-mono"><code>{lesson.solution}</code></pre>
                <button
                  onClick={() => setCode(lesson.solution)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Load solution into editor →
                </button>
              </div>
            )}

            {/* Quiz */}
            <AnimatePresence>
              {(quizOpen || passed) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Quick Quiz</h3>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-3">{lesson.quiz.question}</p>
                  <div className="grid gap-2 mb-3">
                    {lesson.quiz.options.map((opt, i) => {
                      const showCorrect = quizAnswer !== null;
                      const isPicked = quizAnswer === i;
                      const isRight = lesson.quiz.correct === i;
                      const cls = showCorrect
                        ? isRight ? 'border-primary bg-primary/10 text-foreground'
                          : isPicked ? 'border-destructive bg-destructive/10 text-foreground'
                          : 'border-border opacity-60'
                        : 'border-border hover:border-primary/40 text-foreground';
                      return (
                        <button key={i} disabled={quizAnswer !== null} onClick={() => setQuizAnswer(i)}
                          className={`flex items-center gap-2 rounded-lg border bg-card p-2.5 text-left text-sm transition-colors ${cls}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                          <span>{opt}</span>
                          {showCorrect && isRight && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                          {showCorrect && isPicked && !isRight && <XCircle className="ml-auto h-4 w-4 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {quizAnswer !== null && (
                    <p className="text-xs text-muted-foreground mb-3">{lesson.quiz.explanation}</p>
                  )}
                  {!passed && quizAnswer !== null && (
                    <button onClick={handleCompleteLesson} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
                      <Trophy className="h-4 w-4" /> Complete Lesson
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {passed && (
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                <p className="text-sm font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Lesson complete!
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lessonIdx < lessons.length - 1 && (
                    <button onClick={() => setLessonIdx(lessonIdx + 1)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                      Next Lesson <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <Link to={`/code/${lang.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
                    Back to Languages
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Right: Editor + Output */}
          <section className="space-y-3">
            <CodeEditor value={code} onChange={setCode} language={lang.prismLang} minHeight={420} />

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleRun} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(130,255,150,0.3)]">
                <Play className="h-4 w-4" /> Run Code
              </button>
              <button onClick={() => setCode('')} className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                Clear
              </button>
              <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                <Zap className="h-3 w-3" /> Attempts: {attemptCount}
              </span>
            </div>

            {/* Output console */}
            <div className="rounded-xl border border-border bg-[#0d0d14] overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 bg-[#181826] px-4 py-2">
                <span className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
                  <Terminal className="h-3.5 w-3.5" /> Output
                </span>
                {runOutput || runError ? (
                  <span className={`text-[10px] font-bold ${normalizeOutput(runOutput) === normalizeOutput(lesson.expectedOutput) ? 'text-primary' : 'text-destructive'}`}>
                    {normalizeOutput(runOutput) === normalizeOutput(lesson.expectedOutput) ? '✓ MATCH' : '✗ MISMATCH'}
                  </span>
                ) : null}
              </div>
              <pre className="p-4 min-h-[80px] text-sm font-mono text-[#e6e6e6] whitespace-pre-wrap overflow-x-auto">
                {runError ? <span className="text-destructive">{runError}</span> : runOutput || <span className="text-muted-foreground">// Click "Run Code" to see output…</span>}
              </pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Expected Output</p>
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{lesson.expectedOutput}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
