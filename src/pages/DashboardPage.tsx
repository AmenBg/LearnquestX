import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import SubjectCard from '@/components/SubjectCard';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, language } = useApp();
  if (!user) return null;

  const xpForNext = user.level * 400;
  const currentProgress = user.xp % 400;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.welcome', language)}, <span className="text-gradient-primary">{user.name}</span>! 👋
          </h1>
          <p className="text-muted-foreground">Keep up the great work. You're on a roll!</p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Zap className="h-6 w-6 text-primary" />} label={t('dashboard.xp', language)} value={user.xp.toLocaleString()} />
          <StatCard icon={<Star className="h-6 w-6 text-secondary" />} label={t('dashboard.level', language)} value={user.level} glowClass="glow-secondary" />
          <StatCard icon={<Flame className="h-6 w-6 text-streak" />} label={t('dashboard.streak', language)} value={`${user.streak} 🔥`} glowClass="glow-accent" />
          <StatCard icon="📚" label="Subjects" value={subjects.length} />
        </div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Level {user.level} → Level {user.level + 1}</span>
            <span className="text-muted-foreground">{currentProgress}/{xpForNext} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-xp"
              initial={{ width: 0 }}
              animate={{ width: `${(currentProgress / xpForNext) * 100}%` }}
              transition={{ duration: 1.2 }}
            />
          </div>
        </motion.div>

        {/* Continue Learning */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{t('dashboard.continue', language)}</h2>
          <Link to="/subjects" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.slice(0, 4).map((s, i) => (
            <SubjectCard key={s.id} subject={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
