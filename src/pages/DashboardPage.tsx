import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import SubjectCard from '@/components/SubjectCard';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, ArrowRight, Gamepad2, Swords, Award } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { profile, authUser, authLoading, language } = useApp();

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;
  if (!profile) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading profile...</div>;

  const xpForNext = profile.level * 400;
  const currentProgress = profile.xp % 400;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {t('dashboard.welcome', language)}, <span className="text-gradient-primary">{profile.name}</span>! 👋
          </h1>
        </motion.div>

        <div className="mb-6 grid gap-3 grid-cols-3">
          <StatCard icon={<Zap className="h-5 w-5 text-primary" />} label={t('dashboard.xp', language)} value={profile.xp.toLocaleString()} />
          <StatCard icon={<Star className="h-5 w-5 text-secondary" />} label={t('dashboard.level', language)} value={profile.level} glowClass="glow-secondary" />
          <StatCard icon={<Flame className="h-5 w-5 text-streak" />} label={t('dashboard.streak', language)} value={`${profile.streak} 🔥`} glowClass="glow-accent" />
        </div>

        {/* XP Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Level {profile.level} → {profile.level + 1}</span>
            <span className="text-muted-foreground">{currentProgress}/{xpForNext} XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-xp" initial={{ width: 0 }} animate={{ width: `${(currentProgress / xpForNext) * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-6 grid gap-3 grid-cols-3">
          <Link to="/arena" className="group rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40 hover:scale-[1.02]">
            <Swords className="h-6 w-6 text-primary mb-1" />
            <h3 className="text-sm font-bold text-foreground">{t('nav.arena', language)}</h3>
            <p className="text-[10px] text-muted-foreground">Earn XP</p>
          </Link>
          <Link to="/store" className="group rounded-xl border border-accent/20 bg-accent/5 p-4 transition-all hover:border-accent/40 hover:scale-[1.02]">
            <Gamepad2 className="h-6 w-6 text-accent mb-1" />
            <h3 className="text-sm font-bold text-foreground">{t('nav.store', language)}</h3>
            <p className="text-[10px] text-muted-foreground">Play games</p>
          </Link>
          <Link to="/achievements" className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:scale-[1.02]">
            <Award className="h-6 w-6 text-streak mb-1" />
            <h3 className="text-sm font-bold text-foreground">{t('nav.achievements', language)}</h3>
            <p className="text-[10px] text-muted-foreground">Progress</p>
          </Link>
        </div>

        {/* Subjects */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t('dashboard.continue', language)}</h2>
          <Link to="/subjects" className="flex items-center gap-1 text-xs text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {subjects.slice(0, 4).map((s, i) => (
            <SubjectCard key={s.id} subject={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
