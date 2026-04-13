import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';

import { motion } from 'framer-motion';
import { Zap, Flame, Star, ArrowRight, Gamepad2, BookOpen, Award, Shuffle } from 'lucide-react';
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
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.welcome', language)}, <span className="text-gradient-primary">{profile.name}</span>! 👋
          </h1>
          <p className="text-muted-foreground">Keep up the great work. You're on a roll!</p>
        </motion.div>

        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Zap className="h-6 w-6 text-primary" />} label={t('dashboard.xp', language)} value={profile.xp.toLocaleString()} />
          <StatCard icon={<Star className="h-6 w-6 text-secondary" />} label={t('dashboard.level', language)} value={profile.level} glowClass="glow-secondary" />
          <StatCard icon={<Flame className="h-6 w-6 text-streak" />} label={t('dashboard.streak', language)} value={`${profile.streak} 🔥`} glowClass="glow-accent" />
          <StatCard icon="📚" label="Subjects" value={subjects.length} />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Level {profile.level} → Level {profile.level + 1}</span>
            <span className="text-muted-foreground">{currentProgress}/{xpForNext} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-xp" initial={{ width: 0 }} animate={{ width: `${(currentProgress / xpForNext) * 100}%` }} transition={{ duration: 1.2 }} />
          </div>
        </motion.div>

        {/* Main Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/learn/random" className="group rounded-xl border border-primary/20 bg-primary/5 p-6 transition-all hover:border-primary/40 hover:scale-[1.02]">
            <Shuffle className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground">Start Learning</h3>
            <p className="text-sm text-muted-foreground">Random subject exercises</p>
          </Link>
          <Link to="/subjects" className="group rounded-xl border border-accent/20 bg-accent/5 p-6 transition-all hover:border-accent/40 hover:scale-[1.02]">
            <BookOpen className="h-10 w-10 text-accent mb-3" />
            <h3 className="text-lg font-bold text-foreground">Subjects</h3>
            <p className="text-sm text-muted-foreground">Choose a specific subject</p>
          </Link>
          <Link to="/store" className="group rounded-xl border border-secondary/20 bg-secondary/5 p-6 transition-all hover:border-secondary/40 hover:scale-[1.02]">
            <Gamepad2 className="h-10 w-10 text-secondary mb-3" />
            <h3 className="text-lg font-bold text-foreground">Games</h3>
            <p className="text-sm text-muted-foreground">Play fun mini-games</p>
          </Link>
          <Link to="/achievements" className="group rounded-xl border border-streak/20 bg-streak/5 p-6 transition-all hover:border-streak/40 hover:scale-[1.02]">
            <Award className="h-10 w-10 text-streak mb-3" />
            <h3 className="text-lg font-bold text-foreground">Achievements</h3>
            <p className="text-sm text-muted-foreground">Track progress & badges</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
