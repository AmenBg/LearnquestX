import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAchievements } from '@/hooks/useAchievements';
import { achievements, achievementCategories } from '@/lib/achievements';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export default function AchievementsPage() {
  const { authUser, authLoading } = useApp();
  const { unlockedIds, unlockedCount, totalCount } = useAchievements(authUser?.id);
  const [category, setCategory] = useState('all');

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;

  const filtered = category === 'all' ? achievements : achievements.filter(a => a.category === category);
  const pct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          </div>
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{unlockedCount}/{totalCount} unlocked</span>
            <Progress value={pct} className="h-2 flex-1 max-w-[200px]" />
            <span className="text-sm font-bold text-primary">{pct}%</span>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {achievementCategories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                category === cat.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((a, i) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className={`rounded-xl border p-4 transition-all ${
                  unlocked ? 'border-primary/30 bg-primary/5' : 'border-border bg-card opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                    {a.id === 'secret_explorer' && !unlocked ? '❓' : a.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{a.id === 'secret_explorer' && !unlocked ? '???' : a.name}</h3>
                      {unlocked && <span className="text-xs text-primary">✓</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.id === 'secret_explorer' && !unlocked ? 'Find the hidden secret...' : a.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">+{a.xpReward} XP</span>
                      {a.title && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{a.title}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
