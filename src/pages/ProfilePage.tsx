import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, BookOpen } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function ProfilePage() {
  const { profile, authUser, authLoading, language } = useApp();

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;
  if (!profile) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;

  const totalCompleted = subjects.reduce((sum, s) => sum + s.completedLevels, 0);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-5 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">🎮</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">Level {profile.level}</p>
          </div>
          <div className="hidden sm:flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{profile.xp.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-streak">{profile.streak}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
          </div>
        </motion.div>

        <h2 className="mb-3 text-lg font-bold text-foreground">{t('profile.stats', language)}</h2>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: <Zap className="h-4 w-4 text-primary" />, label: 'Total XP', value: profile.xp.toLocaleString() },
            { icon: <Flame className="h-4 w-4 text-streak" />, label: 'Streak', value: `${profile.streak} days` },
            { icon: <Star className="h-4 w-4 text-secondary" />, label: 'Level', value: profile.level },
            { icon: <BookOpen className="h-4 w-4 text-accent" />, label: 'Lessons', value: totalCompleted },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="mb-1 flex justify-center">{stat.icon}</div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Link to="/achievements" className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3 font-semibold text-primary transition-all hover:bg-primary/10">
          🏆 {t('profile.achievements', language)}
        </Link>
      </div>
    </div>
  );
}
