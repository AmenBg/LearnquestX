import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  streak: number;
  user_id: string;
}

export default function LeaderboardPage() {
  const { language, authUser } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('name, xp, level, streak, user_id')
      .order('xp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setEntries(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t('leaderboard.title', language)}</h1>
          <p className="mb-6 text-sm text-muted-foreground">Top learners</p>
        </motion.div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No learners yet. Be the first! 🚀
          </div>
        ) : (
          <>
            {/* Top 3 */}
            {entries.length >= 3 && (
              <div className="mb-6 flex items-end justify-center gap-3">
                {[entries[1], entries[0], entries[2]].map((entry, i) => {
                  const heights = ['h-20', 'h-28', 'h-16'];
                  const medals = ['🥈', '🥇', '🥉'];
                  return (
                    <motion.div key={entry.user_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="flex flex-col items-center">
                      <span className="mb-1 text-xs font-semibold text-foreground">{entry.name}</span>
                      <span className="mb-1 text-[10px] text-muted-foreground">{entry.xp.toLocaleString()} XP</span>
                      <div className={`${heights[i]} w-16 rounded-t-xl bg-gradient-to-t from-muted to-card border border-border flex items-center justify-center text-xl`}>
                        {medals[i]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {entries.map((entry, i) => {
                const isYou = entry.user_id === authUser?.id;
                return (
                  <motion.div key={entry.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-3 px-4 py-3 ${isYou ? 'bg-primary/5 border-l-2 border-l-primary' : ''} ${i !== entries.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <span className={`w-6 text-center text-xs font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>#{i + 1}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isYou ? 'text-primary' : 'text-foreground'}`}>
                        {entry.name} {isYou && '(You)'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Lv.{entry.level} • {entry.streak}🔥</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{entry.xp.toLocaleString()} XP</span>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
