import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { miniGames } from '@/lib/miniGames';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, Lock, Gamepad2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function GameStorePage() {
  const { profile, authUser, addXp, refetchProfile } = useApp();
  const navigate = useNavigate();
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState<string | null>(null);

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
      toast.error('Not enough XP! Keep learning to earn more.');
      return;
    }
    setPurchasing(gameId);
    
    // Deduct XP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: profile.xp - xpCost })
      .eq('user_id', authUser.id);

    if (updateError) {
      toast.error('Failed to purchase');
      setPurchasing(null);
      return;
    }

    // Record purchase
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

  const categories = ['math', 'logic', 'memory', 'speed', 'word'] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">XP Game Store</h1>
          </div>
          <p className="mb-4 text-muted-foreground">Spend your hard-earned XP to unlock mini-games!</p>
          {profile && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" /> Your XP: {profile.xp.toLocaleString()}
            </div>
          )}
        </motion.div>

        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="mb-4 text-lg font-bold capitalize text-foreground">{cat} Games</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {miniGames.filter(g => g.category === cat).map((game, i) => {
                const owned = purchasedIds.has(game.id);
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border p-5 transition-all ${
                      owned ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-primary/20'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-3xl">{game.icon}</span>
                      {owned ? (
                        <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">Owned</span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <Zap className="h-3 w-3" /> {game.xpCost}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 font-semibold text-foreground">{game.name}</h3>
                    <p className="mb-4 text-xs text-muted-foreground">{game.description}</p>
                    {owned ? (
                      <button
                        onClick={() => navigate(`/play/${game.id}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        <Gamepad2 className="h-4 w-4" /> Play
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(game.id, game.xpCost)}
                        disabled={purchasing === game.id || !profile || profile.xp < game.xpCost}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/30 disabled:opacity-50"
                      >
                        {purchasing === game.id ? '...' : <><ShoppingCart className="h-4 w-4" /> Buy for {game.xpCost} XP</>}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
