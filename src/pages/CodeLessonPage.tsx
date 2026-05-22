import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import { useApp } from '@/contexts/AppContext';
import { getLanguage, getLessons, getLevel, CodeLesson, getLevelLabel } from '@/lib/codeLessons';
import { runCode, normalizeOutput } from '@/lib/codeRunner';
import {
  ArrowLeft, ArrowRight, Play, Lightbulb, Eye, CheckCircle2,
  XCircle, Lock, Trophy, Zap, Sparkles, Terminal, ListTree, BookOpen, AlertTriangle, Info, Code2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

interface Progress {
  completed: number[];
  current: number;
  firstTry: Record<number, boolean>;
  streak: number;
}

function storageKey(userId: string | undefined, lang: string, level: string) {
  return `code_progress_v2:${userId || 'anon'}:${lang}:${level}`;
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
  const { t } = useTranslation(language);

  const lang = getLanguage(langId || '');
  const level = getLevel(levelId || '');
  const lessons = useMemo(() => (langId ? getLessons(langId, language) : []), [langId, language]);

  const pkey = storageKey(authUser?.id, langId || '', levelId || '');
  const [progress, setProgress] = useState<Progress>(() => loadProgress(pkey, level?.startIndex ?? 0));
  const [lessonIdx, setLessonIdx] = useState<number>(progress.current);

  const lesson: CodeLesson | undefined = lessons[lessonIdx];

  const [code, setCode] = useState('');
  const [runOutput, setRunOutput] = useState<string>('');
  const [runError, setRunError] = useState<string>('');
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active tab in mobile view, but desktop shows all
  const [activeTab, setActiveTab] = useState<'learn' | 'code'>('learn');

  useEffect(() => {
    if (!lesson) return;
    setCode('');
    setRunOutput('');
    setRunError('');
    setHintsShown(0);
    setSolutionShown(false);
    setQuizOpen(false);
    setQuizAnswer(null);
    setPassed(progress.completed.includes(lesson.index));
    setAttemptCount(0);
    setActiveTab('learn');
    const next = { ...progress, current: lesson.index };
    setProgress(next);
    saveProgress(pkey, next);
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
      toast.success(language === 'ar' ? '✅ النتيجة صحيحة!' : language === 'fr' ? '✅ Résultat correct!' : '✅ Output matches!');
      if (!quizOpen) setQuizOpen(true);
    }
  };

  const handleCompleteLesson = async () => {
    if (passed) return;
    setPassed(true);

    let xp = Math.round(lesson.baseXp * level.xpMultiplier);
    const bonuses: string[] = [];
    if (attemptCount <= 1) { xp += 15; bonuses.push('First-try +15'); }
    if (hintsShown === 0 && !solutionShown) { xp += 10; bonuses.push('No-hints +10'); }
    if (quizAnswer === lesson.quiz.correct) { xp += 10; bonuses.push('Quiz +10'); }

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

    toast.success(`+${xp} XP`, {
      description: bonuses.length ? bonuses.join(' • ') : 'Lesson complete',
      duration: 5000,
    });
  };

  const goToLesson = (i: number) => {
    if (isLessonLocked(i)) {
      toast.error('🔒 Locked');
      return;
    }
    setLessonIdx(i);
  };

  const progressPct = Math.round((progress.completed.length / lessons.length) * 100);
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="pt-16 h-screen flex flex-col overflow-hidden">
        {/* Top header */}
        <div className="border-b border-border bg-card/50 backdrop-blur shrink-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/code/${lang.id}`} className="text-muted-foreground hover:text-foreground shrink-0">
                {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
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
                <ListTree className="h-3.5 w-3.5" />
              </button>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {progress.completed.length}/{lessons.length} • {progressPct}%
              </div>
            </div>
          </div>
          <div className="h-1 bg-muted">
            <div className="h-full bg-gradient-xp transition-all" style={{ width: \`\${progressPct}%\` }} />
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden lg:flex shrink-0 border-r border-border bg-card/30 flex-col overflow-hidden"
              >
                <div className="p-3 border-b border-border/50">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Curriculum</h3>
                </div>
                <ul className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {lessons.map(l => {
                    const locked = isLessonLocked(l.index);
                    const done = progress.completed.includes(l.index);
                    const active = l.index === lesson.index;
                    return (
                      <li key={l.index}>
                        <button
                          onClick={() => goToLesson(l.index)}
                          disabled={locked}
                          className={\`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors \${
                            active ? 'bg-primary/15 text-primary font-semibold' :
                            locked ? 'text-muted-foreground/40 cursor-not-allowed' :
                            'text-foreground hover:bg-muted'
                          }\`}
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
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
            {/* Left: Learning Content */}
            <div className={\`flex flex-col border-r border-border overflow-y-auto custom-scrollbar bg-background \${activeTab === 'code' ? 'hidden lg:flex' : 'flex'}\`}>
              <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8">
                
                {/* Intro Section */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      {language === 'ar' ? 'المفهوم' : language === 'fr' ? 'Concept' : 'CONCEPT'}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">+{Math.round(lesson.baseXp * level.xpMultiplier)} XP</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-4">{lesson.topic}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                      {lesson.introduction}
                    </p>
                  </div>
                </section>

                <hr className="border-border/50" />

                {/* Theory Section */}
                <section>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-foreground">
                    <BookOpen className="h-5 w-5 text-accent" />
                    {language === 'ar' ? 'كيف يعمل؟' : language === 'fr' ? 'Comment ça marche?' : 'How it works'}
                  </h3>
                  <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed space-y-4">
                    {lesson.theory.split('\\n\\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>

                {/* Example Section */}
                <section className="bg-card/50 rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Code2 className="h-4 w-4" /> 
                    {language === 'ar' ? 'مثال برمجي' : language === 'fr' ? 'Exemple de code' : 'Code Example'}
                  </h3>
                  <pre className="rounded-xl bg-[#1e1e2e] text-[#f8f8f2] text-sm p-4 overflow-x-auto font-mono shadow-inner mb-4 border border-white/5">
                    <code>{lesson.example}</code>
                  </pre>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground">
                      {language === 'ar' ? 'شرح الكود:' : language === 'fr' ? 'Explication:' : 'Line-by-line explanation:'}
                    </h4>
                    <ul className="space-y-2">
                      {lesson.exampleExplanation.map((exp, i) => (
                        <li key={i} className="flex gap-3 text-sm text-foreground/80">
                          <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded text-xs shrink-0 mt-0.5">{i + 1}</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Common Mistakes */}
                <section className="bg-destructive/5 rounded-2xl border border-destructive/20 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    {language === 'ar' ? 'أخطاء شائعة' : language === 'fr' ? 'Erreurs fréquentes' : 'Common Mistakes'}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {lesson.commonMistakes}
                  </p>
                </section>

                <hr className="border-border/50" />

                {/* Challenge */}
                <section>
                  <h3 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    {language === 'ar' ? 'التحدي' : language === 'fr' ? 'Le Défi' : 'The Challenge'}
                  </h3>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                    <p className="text-lg text-foreground font-medium leading-relaxed mb-4">
                      {lesson.challenge}
                    </p>
                    <button 
                      onClick={() => setActiveTab('code')}
                      className="lg:hidden w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg"
                    >
                      {language === 'ar' ? 'ابدأ البرمجة' : language === 'fr' ? 'Commencer à coder' : 'Start Coding'}
                    </button>
                  </div>
                </section>

                {/* Tools */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setHintsShown(h => Math.min(h + 1, lesson.hints.length))} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-primary/40 transition-colors">
                    <Lightbulb className="h-4 w-4 text-accent" /> Hint ({hintsShown}/{lesson.hints.length})
                  </button>
                  <button onClick={() => setSolutionShown(s => !s)} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-primary/40 transition-colors">
                    <Eye className="h-4 w-4" /> {solutionShown ? 'Hide' : 'Reveal'} Solution
                  </button>
                </div>

                {hintsShown > 0 && (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
                    <h4 className="text-xs font-bold uppercase text-accent mb-3 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" /> Hints
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground/85">
                      {lesson.hints.slice(0, hintsShown).map((h, i) => <li key={i}>{h}</li>)}
                    </ol>
                  </div>
                )}

                {solutionShown && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Solution</h4>
                    <pre className="rounded-xl bg-[#1e1e2e] text-[#f8f8f2] text-sm p-4 overflow-x-auto font-mono shadow-inner border border-white/5">
                      <code>{lesson.solution}</code>
                    </pre>
                    <button
                      onClick={() => setCode(lesson.solution)}
                      className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Load solution into editor <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Quiz */}
                <AnimatePresence>
                  {(quizOpen || passed) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/30 bg-card p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">
                          {language === 'ar' ? 'اختبار سريع' : language === 'fr' ? 'Quiz Rapide' : 'Quick Knowledge Check'}
                        </h3>
                      </div>
                      <p className="text-base font-medium text-foreground mb-5">{lesson.quiz.question}</p>
                      <div className="grid gap-3 mb-4">
                        {lesson.quiz.options.map((opt, i) => {
                          const showCorrect = quizAnswer !== null;
                          const isPicked = quizAnswer === i;
                          const isRight = lesson.quiz.correct === i;
                          const cls = showCorrect
                            ? isRight ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/20'
                              : isPicked ? 'border-destructive bg-destructive/10 text-foreground ring-2 ring-destructive/20'
                              : 'border-border opacity-50'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50 text-foreground';
                          return (
                            <button key={i} disabled={quizAnswer !== null} onClick={() => setQuizAnswer(i)}
                              className={\`flex items-center gap-3 rounded-xl border bg-card p-3.5 text-left text-sm transition-all \${cls}\`}
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                              <span className="flex-1">{opt}</span>
                              {showCorrect && isRight && <CheckCircle2 className="h-5 w-5 text-primary" />}
                              {showCorrect && isPicked && !isRight && <XCircle className="h-5 w-5 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswer !== null && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                          <p className="text-sm text-foreground/90 flex items-start gap-2">
                            <Info className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                            {lesson.quiz.explanation}
                          </p>
                        </motion.div>
                      )}
                      {!passed && quizAnswer !== null && (
                        <button onClick={handleCompleteLesson} className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                          <Trophy className="h-5 w-5" /> 
                          {language === 'ar' ? 'إكمال الدرس' : language === 'fr' ? 'Terminer la leçon' : 'Complete Lesson'}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {passed && (
                  <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Lesson Complete!</h3>
                    <p className="text-sm text-muted-foreground mb-6">Awesome work. You're ready for the next challenge.</p>
                    
                    <div className="flex flex-wrap justify-center gap-3 w-full">
                      {lessonIdx < lessons.length - 1 && (
                        <button onClick={() => setLessonIdx(lessonIdx + 1)} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                          Next Lesson <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      <Link to={\`/code/\${lang.id}\`} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-muted transition-colors">
                        Back to Map
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="h-8"></div>
              </div>
            </div>

            {/* Right: Code Editor & Output */}
            <div className={\`flex flex-col bg-[#0f0f13] relative \${activeTab === 'learn' ? 'hidden lg:flex' : 'flex'}\`}>
              {/* Mobile Tabs Header */}
              <div className="lg:hidden flex border-b border-border/20 bg-card p-2 gap-2">
                <button 
                  onClick={() => setActiveTab('learn')}
                  className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${activeTab === 'learn' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}\`}
                >
                  <BookOpen className="h-3 w-3 inline mr-1 mb-0.5" /> Learn
                </button>
                <button 
                  onClick={() => setActiveTab('code')}
                  className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${activeTab === 'code' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}\`}
                >
                  <Code2 className="h-3 w-3 inline mr-1 mb-0.5" /> Code
                </button>
              </div>

              <div className="flex-1 flex flex-col p-4 gap-4 h-full overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 border border-border/30 rounded-xl overflow-hidden shadow-2xl bg-[#1e1e2e]">
                  <CodeEditor 
                    value={code} 
                    onChange={setCode} 
                    language={lang.prismLang} 
                    minHeight={300} 
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button onClick={handleRun} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(130,255,150,0.3)] transition-all hover:scale-[1.02]">
                    <Play className="h-4 w-4" /> 
                    {language === 'ar' ? 'تشغيل' : language === 'fr' ? 'Exécuter' : 'Run Code'}
                  </button>
                  <button onClick={() => setCode('')} className="rounded-xl border border-border bg-card px-5 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {language === 'ar' ? 'مسح' : language === 'fr' ? 'Effacer' : 'Clear'}
                  </button>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1 bg-card/50 px-3 py-1.5 rounded-lg border border-border/50">
                    <Zap className="h-3.5 w-3.5 text-accent" /> Attempts: {attemptCount}
                  </span>
                </div>

                {/* Output Console */}
                <div className="shrink-0 h-48 rounded-xl border border-border/30 bg-[#0a0a0f] flex flex-col overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between border-b border-border/30 bg-[#14141e] px-4 py-2 shrink-0">
                    <span className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      <Terminal className="h-3.5 w-3.5" /> Console Output
                    </span>
                    {runOutput || runError ? (
                      <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${normalizeOutput(runOutput) === normalizeOutput(lesson.expectedOutput) ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}\`}>
                        {normalizeOutput(runOutput) === normalizeOutput(lesson.expectedOutput) ? '✓ MATCH' : '✗ MISMATCH'}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 overflow-auto p-4 relative custom-scrollbar">
                    {runError ? (
                      <pre className="text-sm font-mono text-destructive whitespace-pre-wrap">{runError}</pre>
                    ) : runOutput ? (
                      <pre className="text-sm font-mono text-[#e6e6e6] whitespace-pre-wrap">{runOutput}</pre>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs font-mono select-none">
                        // Output will appear here
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected Output */}
                <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Expected Output
                  </p>
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{lesson.expectedOutput}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
