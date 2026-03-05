import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { leaderboard } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t('leaderboard.title', language)}</h1>
          <p className="mb-8 text-muted-foreground">Top learners this week</p>
        </motion.div>

        {/* Top 3 */}
        <div className="mb-8 flex items-end justify-center gap-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const heights = ['h-24', 'h-32', 'h-20'];
            const medals = ['🥈', '🥇', '🥉'];
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center"
              >
                <span className="mb-2 text-3xl">{entry.avatar}</span>
                <span className="mb-1 text-sm font-semibold text-foreground">{entry.name}</span>
                <span className="mb-2 text-xs text-muted-foreground">{entry.xp.toLocaleString()} XP</span>
                <div className={`${heights[i]} w-20 rounded-t-xl bg-gradient-to-t from-muted to-card border border-border flex items-center justify-center text-2xl`}>
                  {medals[i]}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 px-5 py-4 ${
                entry.name === 'You' ? 'bg-primary/5 border-l-2 border-l-primary' : ''
              } ${i !== leaderboard.length - 1 ? 'border-b border-border' : ''}`}
            >
              <span className={`w-8 text-center text-sm font-bold ${
                entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
              }`}>
                #{entry.rank}
              </span>
              <span className="text-2xl">{entry.avatar}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${entry.name === 'You' ? 'text-primary' : 'text-foreground'}`}>
                  {entry.name}
                </p>
                <p className="text-xs text-muted-foreground">Level {entry.level}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{entry.xp.toLocaleString()} XP</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
