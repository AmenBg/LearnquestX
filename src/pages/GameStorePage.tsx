import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { miniGames } from '@/lib/miniGames';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, Gamepad2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function GameStorePage() {
  const { profile, authUser, refetchProfile, language } = useApp();
  const navigate = useNavigate();
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (!authUser) return;
    supabase
      .from('purchased_games')
      .select('game_id')
      .eq('user_id', authUser.id)
      .then(({ data }) => {
        if (data) setPurchasedIds(new Set(data.map(d => d.game_id)));
      });
  }, [authUser]);

  const handlePurchase = async (gameId: string, xpCost: number) => {
    if (!authUser || !profile) return;
    if (profile.xp < xpCost) {
      toast.error(language === 'ar' ? 'لا توجد نقاط كافية! تابع التعلم.' : language === 'fr' ? 'Pas assez de XP ! Continuez à apprendre.' : 'Not enough XP! Keep learning to earn more.');
      return;
    }
    setPurchasing(gameId);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: profile.xp - xpCost })
      .eq('user_id', authUser.id);

    if (updateError) {
      toast.error('Failed to purchase');
      setPurchasing(null);
      return;
    }

    const { error: insertError } = await supabase
      .from('purchased_games')
      .insert({ user_id: authUser.id, game_id: gameId, xp_cost: xpCost });

    if (insertError) {
      toast.error('Failed to record purchase');
    } else {
      toast.success('Game unlocked! 🎮');
      setPurchasedIds(prev => new Set([...prev, gameId]));
      await refetchProfile();
    }
    setPurchasing(null);
  };

  const categories = [
    { id: 'all', label: '🎮 All' },
    { id: 'math', label: '🧮 Math' },
    { id: 'logic', label: '🧩 Logic' },
    { id: 'memory', label: '🧠 Memory' },
    { id: 'speed', label: '⚡ Speed' },
    { id: 'word', label: '📝 Word' },
    { id: 'strategy', label: '♟️ Strategy' },
    { id: 'chess', label: '♚ Chess' },
  ];

  const filteredGames = activeCategory === 'all' ? miniGames : miniGames.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-1 flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('nav.store', language)}</h1>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            {language === 'ar' ? 'الألعاب مكافآت — اكسب XP من التعلم لفتحها!' : language === 'fr' ? 'Les jeux sont des récompenses — gagnez des XP en apprenant !' : 'Games are rewards — earn XP from learning to unlock them!'}
          </p>
          {profile && (
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" /> {profile.xp.toLocaleString()} XP
            </div>
          )}
        </motion.div>

        {/* Category filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat.id ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredGames.map((game, i) => {
            const owned = purchasedIds.has(game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`rounded-xl border p-4 transition-all ${owned ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{game.icon}</span>
                  {owned ? (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">✓</span>
                  ) : (
                    <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Zap className="h-2.5 w-2.5" /> {game.xpCost}
                    </span>
                  )}
                </div>
                <h3 className="mb-0.5 text-xs font-semibold text-foreground">{game.name}</h3>
                <p className="mb-3 text-[10px] text-muted-foreground line-clamp-2">{game.description}</p>
                {owned ? (
                  <button
                    onClick={() => navigate(game.id === 'chess' ? '/chess' : `/play/${game.id}`)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Gamepad2 className="h-3.5 w-3.5" /> Play
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(game.id, game.xpCost)}
                    disabled={purchasing === game.id || !profile || profile.xp < game.xpCost}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/30 disabled:opacity-50"
                  >
                    {purchasing === game.id ? '...' : <><ShoppingCart className="h-3.5 w-3.5" /> {game.xpCost} XP</>}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
