import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import PageSeo from '@/components/PageSeo';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, ArrowRight, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

interface SubjectProgress {
  subject_id: string;
  lessons_completed: number;
  total_xp_earned: number;
  updated_at: string;
}
interface ActivityItem {
  created_at: string;
  was_correct: boolean;
  xp_earned: number;
  subject_id: string;
  question_text: string | null;
}

export default function DashboardPage() {
  const { profile, authUser, authLoading, language } = useApp();
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      const [{ data: prog }, { data: hist }] = await Promise.all([
        supabase.from('subject_progress')
          .select('subject_id, lessons_completed, total_xp_earned, updated_at')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false }),
        supabase.from('exercise_history')
          .select('created_at, was_correct, xp_earned, subject_id, question_text')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      setProgress((prog as SubjectProgress[]) || []);
      const list = (hist as ActivityItem[]) || [];
      setActivity(list.slice(0, 6));
      const total = list.length;
      const correct = list.filter(h => h.was_correct).length;
      setStats({ total, correct });
    })();
  }, [authUser]);

  const continueSubject = useMemo(() => {
    if (!progress.length) return subjects[0];
    return subjects.find(s => s.id === progress[0].subject_id) || subjects[0];
  }, [progress]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;
  if (!profile) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading profile...</div>;

  const xpForNext = profile.level * 400;
  const currentProgress = profile.xp % 400;
  const levelPct = Math.round((currentProgress / xpForNext) * 100);
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <PageSeo
        title="Dashboard — LearnQuest"
        description="Your learning dashboard. Track your level, XP, streak, and continue where you left off."
        path="/dashboard"
      />
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          aria-labelledby="welcome-heading"
        >
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
          <h1 id="welcome-heading" className="mt-1 text-3xl md:text-4xl font-bold">
            {t('dashboard.welcome', language)}, <span className="text-gradient-aurora">{profile.name}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ready for today's practice? You're {currentProgress}/{xpForNext} XP into level {profile.level}.
          </p>
        </motion.section>

        {/* Level + Continue learning */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 premium-card p-6"
            aria-labelledby="level-heading"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="level-heading" className="text-lg font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary" /> Level {profile.level}
              </h2>
              <span className="text-sm text-muted-foreground">{currentProgress}/{xpForNext} XP</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${levelPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-xp"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{xpForNext - currentProgress} XP until level {profile.level + 1}</p>

            <section className="mt-6" aria-labelledby="navigation-heading">
              <h2 id="navigation-heading" className="sr-only">Navigation</h2>
              <h3 className="text-xs font-normal uppercase tracking-wider text-muted-foreground mb-2">Continue learning</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{continueSubject.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{continueSubject.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{continueSubject.description}</p>
                </div>
                <Link
                  to={`/learn/${continueSubject.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover-lift"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-3 md:grid-cols-1 gap-4"
            aria-labelledby="stats-heading"
          >
            <h2 id="stats-heading" className="sr-only">Stats</h2>
            <StatTile icon={<Zap className="h-5 w-5" />} label="Total XP" value={profile.xp.toLocaleString()} tint="primary" />
            <StatTile icon={<Flame className="h-5 w-5" />} label="Day streak" value={profile.streak} tint="streak" />
            <StatTile icon={<Target className="h-5 w-5" />} label="Accuracy" value={`${accuracy}%`} tint="accent" />
          </motion.section>
        </div>

        {/* Progress overview + Recent activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6"
            aria-labelledby="progress-heading"
          >
            <h2 id="progress-heading" className="text-lg font-bold mb-4">Progress overview</h2>
            {progress.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No progress yet. Start your first lesson!</p>
                <Link to="/subjects" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Browse subjects <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {progress.slice(0, 5).map(p => {
                  const s = subjects.find(x => x.id === p.subject_id);
                  if (!s) return null;
                  const pct = Math.min(100, Math.round((p.lessons_completed / 30) * 100));
                  return (
                    <li key={p.subject_id}>
                      <Link to={`/learn/${p.subject_id}`} className="block group">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-xl">{s.icon}</span>
                          <span className="font-medium text-sm flex-1">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{p.lessons_completed} lessons · {p.total_xp_earned} XP</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-xp transition-all group-hover:brightness-110" style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="premium-card p-6"
            aria-labelledby="activity-heading"
          >
            <h2 id="activity-heading" className="text-lg font-bold mb-4">Recent activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity yet — answers will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {activity.map((a, i) => {
                  const s = subjects.find(x => x.id === a.subject_id);
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm py-1.5 border-b border-border/40 last:border-0">
                      <span className="mt-0.5">
                        {a.was_correct
                          ? <CheckCircle2 className="h-4 w-4 text-primary" />
                          : <XCircle className="h-4 w-4 text-destructive" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate text-xs">
                          {a.question_text || `${s?.name || 'Practice'} exercise`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s?.icon} {s?.name || 'Subject'} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          {a.xp_earned > 0 && <span className="text-primary"> · +{a.xp_earned} XP</span>}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
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
    <div className="premium-card p-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tintMap[tint]}`}>
        {icon}
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
