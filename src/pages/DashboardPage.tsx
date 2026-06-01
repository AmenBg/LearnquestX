import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects, achievements } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import PageSeo from '@/components/PageSeo';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Zap, Flame, Star, ArrowRight, Gamepad2, BookOpen, Award, Shuffle,
  Trophy, Target, Clock, TrendingUp, Sparkles, CheckCircle2,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface DailyXp { day: string; xp: number; correct: number; }
interface SubjectProgress {
  subject_id: string;
  lessons_completed: number;
  total_xp_earned: number;
  current_lesson: string | null;
  updated_at: string;
}

export default function DashboardPage() {
  const { profile, authUser, authLoading, language } = useApp();
  const [weekly, setWeekly] = useState<DailyXp[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, minutes: 0 });
  const [unlocked, setUnlocked] = useState(0);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      const since = subDays(new Date(), 6).toISOString();
      const [{ data: hist }, { data: prog }, { data: ach }] = await Promise.all([
        supabase.from('exercise_history').select('created_at, xp_earned, was_correct').eq('user_id', authUser.id).gte('created_at', since),
        supabase.from('subject_progress').select('subject_id, lessons_completed, total_xp_earned, current_lesson, updated_at').eq('user_id', authUser.id).order('updated_at', { ascending: false }),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', authUser.id),
      ]);

      const buckets: Record<string, DailyXp> = {};
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'EEE');
        buckets[d] = { day: d, xp: 0, correct: 0 };
      }
      let total = 0, correct = 0;
      (hist || []).forEach(h => {
        const d = format(startOfDay(new Date(h.created_at)), 'EEE');
        if (buckets[d]) { buckets[d].xp += h.xp_earned || 0; if (h.was_correct) buckets[d].correct += 1; }
        total += 1; if (h.was_correct) correct += 1;
      });
      setWeekly(Object.values(buckets));
      setStats({ total, correct, minutes: Math.round(total * 0.6) });
      setProgress((prog as SubjectProgress[]) || []);
      setUnlocked((ach || []).length);
    })();
  }, [authUser]);

  const continueSubject = useMemo(() => {
    if (!progress.length) return subjects[0];
    const top = progress[0];
    return subjects.find(s => s.id === top.subject_id) || subjects[0];
  }, [progress]);

  const recommendations = useMemo(() => {
    const done = new Set(progress.map(p => p.subject_id));
    return subjects.filter(s => !done.has(s.id)).slice(0, 3);
  }, [progress]);

  // Deterministic daily challenge (same for all users that day)
  const dailyChallenge = useMemo(() => {
    const idx = new Date().getDate() % subjects.length;
    return subjects[idx];
  }, []);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;
  if (!profile) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading profile...</div>;

  const xpForNext = profile.level * 400;
  const currentProgress = profile.xp % 400;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const weeklyTotal = weekly.reduce((s, d) => s + d.xp, 0);
  const goal = 500; // weekly XP goal
  const goalPct = Math.min(100, Math.round((weeklyTotal / goal) * 100));

  return (
    <div className="min-h-screen">
      <PageSeo
        title="Dashboard — LearnQuest"
        description="Your premium learning dashboard. Track XP, streaks, weekly progress, and resume where you left off."
        path="/dashboard"
      />
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* Hero / Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-3xl premium-card p-6 md:p-8"
          aria-labelledby="welcome-heading"
        >
          <div className="absolute inset-0 bg-gradient-aurora opacity-60 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
              <h1 id="welcome-heading" className="mt-1 text-3xl md:text-4xl font-bold">
                {t('dashboard.welcome', language)}, <span className="text-gradient-aurora">{profile.name}</span>
              </h1>
              <p className="mt-2 text-muted-foreground max-w-lg">
                You're {currentProgress}/{xpForNext} XP into level {profile.level}. Keep the momentum going.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/learn/random" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-primary hover-lift">
                <Sparkles className="h-4 w-4" /> Resume learning
              </Link>
              <Link to="/subjects" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold text-foreground hover-lift">
                Browse subjects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="relative mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Level {profile.level}</span>
              <span>{currentProgress}/{xpForNext} XP → Level {profile.level + 1}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${(currentProgress / xpForNext) * 100}%` }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-xp"
              />
            </div>
          </div>
        </motion.section>

        {/* Stats grid */}
        <section aria-labelledby="stats-heading" className="mb-8">
          <h2 id="stats-heading" className="sr-only">Stats</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile icon={<Zap className="h-5 w-5" />} label="Total XP" value={profile.xp.toLocaleString()} tint="primary" />
            <StatTile icon={<Flame className="h-5 w-5" />} label="Day streak" value={`${profile.streak}`} tint="streak" />
            <StatTile icon={<Star className="h-5 w-5" />} label="Level" value={profile.level} tint="secondary" />
            <StatTile icon={<Target className="h-5 w-5" />} label="Accuracy" value={`${accuracy}%`} tint="accent" />
          </div>
        </section>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly chart */}
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 premium-card p-6"
            aria-labelledby="weekly-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="weekly-heading" className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> This week
                </h2>
                <p className="text-sm text-muted-foreground">{weeklyTotal} XP earned • goal {goal} XP ({goalPct}%)</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gradient-primary">{weeklyTotal}</p>
                <p className="text-xs text-muted-foreground">weekly XP</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#xpFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Weekly goal bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Weekly goal</span><span>{weeklyTotal}/{goal} XP</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-xp" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
          </motion.section>

          {/* Continue learning */}
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="premium-card p-6 flex flex-col"
            aria-labelledby="continue-heading"
          >
            <h2 id="continue-heading" className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" /> Continue learning
            </h2>
            <div className="mt-4 flex-1 flex flex-col items-start">
              <div className="text-5xl mb-3">{continueSubject.icon}</div>
              <h3 className="text-xl font-bold">{continueSubject.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{continueSubject.description}</p>
              {progress[0] && (
                <div className="w-full mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{progress[0].lessons_completed} lessons</span>
                    <span>{progress[0].total_xp_earned} XP</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-xp" style={{ width: `${Math.min(100, (progress[0].lessons_completed / 50) * 100)}%` }} />
                  </div>
                </div>
              )}
              <Link to={`/learn/${continueSubject.id}`} className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover-lift">
                Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>
        </div>

        {/* Daily challenge + recommended */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6 relative overflow-hidden" aria-labelledby="daily-heading">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-accent text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Daily challenge
              </div>
              <h2 id="daily-heading" className="text-xl font-bold mt-2">{dailyChallenge.icon} {dailyChallenge.name} sprint</h2>
              <p className="text-sm text-muted-foreground mt-1">Complete 5 exercises today and earn bonus XP.</p>
              <Link to={`/learn/${dailyChallenge.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover-lift">
                Start challenge <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2 premium-card p-6" aria-labelledby="recommended-heading">
            <h2 id="recommended-heading" className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" /> Recommended for you
            </h2>
            <p className="text-sm text-muted-foreground">Subjects you haven't started yet</p>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {recommendations.map(s => (
                <Link key={s.id} to={`/learn/${s.id}`} className="group rounded-2xl border border-border bg-card/60 p-4 hover-lift">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition">
                    Start <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Achievements + Quick nav */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 premium-card p-6" aria-labelledby="ach-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="ach-heading" className="text-lg font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Achievements
              </h2>
              <Link to="/achievements" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{unlocked} unlocked of {achievements.length}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {achievements.slice(0, 8).map(a => (
                <div key={a.id} className={`aspect-square rounded-2xl border flex items-center justify-center text-3xl transition ${a.unlocked ? 'border-primary/40 bg-primary/10 glow-primary' : 'border-border bg-muted/40 opacity-40'}`} title={a.name}>
                  {a.icon}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="premium-card p-6" aria-labelledby="nav-heading">
            <h2 id="nav-heading" className="text-lg font-bold mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink to="/learn/random" icon={<Shuffle className="h-5 w-5" />} label="Random" />
              <QuickLink to="/subjects" icon={<BookOpen className="h-5 w-5" />} label="Subjects" />
              <QuickLink to="/store" icon={<Gamepad2 className="h-5 w-5" />} label="Games" />
              <QuickLink to="/leaderboard" icon={<Trophy className="h-5 w-5" />} label="Ranks" />
              <QuickLink to="/achievements" icon={<Award className="h-5 w-5" />} label="Badges" />
              <QuickLink to="/code" icon={<CheckCircle2 className="h-5 w-5" />} label="Code" />
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string | number; tint: 'primary' | 'secondary' | 'accent' | 'streak' }) {
  const tintMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    streak: 'from-streak/20 to-streak/5 text-streak',
  };
  return (
    <motion.div whileHover={{ y: -3 }} className="premium-card p-5">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tintMap[tint]}`}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 p-4 hover-lift text-foreground">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
