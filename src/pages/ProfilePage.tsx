import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { achievements, subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, BookOpen, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, language } = useApp();
  if (!user) return null;

  const totalCompleted = subjects.reduce((sum, s) => sum + s.completedLevels, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-12">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-6 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
            🎮
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground">Level {user.level} Learner</p>
          </div>
          <div className="hidden sm:flex gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{user.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-streak">{user.streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <h2 className="mb-4 text-xl font-bold text-foreground">{t('profile.stats', language)}</h2>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: <Zap className="h-5 w-5 text-primary" />, label: 'Total XP', value: user.xp.toLocaleString() },
            { icon: <Flame className="h-5 w-5 text-streak" />, label: 'Best Streak', value: `${user.streak} days` },
            { icon: <Star className="h-5 w-5 text-secondary" />, label: 'Level', value: user.level },
            { icon: <BookOpen className="h-5 w-5 text-level-glow" />, label: 'Lessons Done', value: totalCompleted },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="mb-2 flex justify-center">{stat.icon}</div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <h2 className="mb-4 text-xl font-bold text-foreground">{t('profile.achievements', language)}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                a.unlocked
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-border bg-card opacity-60'
              }`}
            >
              <span className="text-3xl">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
              {!a.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
