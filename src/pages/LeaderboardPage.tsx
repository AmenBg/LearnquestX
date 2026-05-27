import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import PageSeo from '@/components/PageSeo';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  user_id: string;
}

export default function LeaderboardPage() {
  const { language, authUser } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    const { data } = await supabase.rpc('get_leaderboard', { p_limit: 10 });
    if (data) setEntries(data.map((d: any) => ({ name: d.name ?? 'Player', xp: d.xp ?? 0, level: d.level ?? 1, user_id: d.user_id ?? '' })));
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Realtime subscription
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t('leaderboard.title', language)}</h1>
          <p className="mb-8 text-muted-foreground">Top 10 learners</p>
        </motion.div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No learners yet. Be the first! 🚀
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div className="mb-8 flex items-end justify-center gap-4">
                {[entries[1], entries[0], entries[2]].map((entry, i) => {
                  const heights = ['h-24', 'h-32', 'h-20'];
                  const medals = ['🥈', '🥇', '🥉'];
                  return (
                    <motion.div key={entry.user_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="flex flex-col items-center">
                      <span className="mb-1 text-sm font-semibold text-foreground">{entry.name}</span>
                      <span className="mb-1 text-xs text-muted-foreground">Lv.{entry.level}</span>
                      <span className="mb-2 text-xs text-muted-foreground">{entry.xp.toLocaleString()} XP</span>
                      <div className={`${heights[i]} w-20 rounded-t-xl bg-gradient-to-t from-muted to-card border border-border flex items-center justify-center text-2xl`}>
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
                  <motion.div key={entry.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-4 px-5 py-4 ${isYou ? 'bg-primary/5 border-l-2 border-l-primary' : ''} ${i !== entries.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <span className={`w-8 text-center text-sm font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>#{i + 1}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isYou ? 'text-primary' : 'text-foreground'}`}>
                        {entry.name} {isYou && '(You)'}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{entry.xp.toLocaleString()} XP</span>
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
