import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { miniGames } from '@/lib/miniGames';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, Gamepad2, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function GameStorePage() {
  const { profile, authUser, refetchProfile } = useApp();
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
    
    // Use server-side RPC for atomic, validated purchase (price comes from server catalog)
    const { error } = await supabase.rpc('purchase_game_rpc', {
      p_game_id: gameId,
    } as any);

    if (error) {
      toast.error(error.message?.includes('already owned') ? 'You already own this game!' : 'Failed to purchase');
    } else {
      toast.success('Game unlocked! 🎮');
      setPurchasedIds(prev => new Set([...prev, gameId]));
      await refetchProfile();
    }
    setPurchasing(null);
  };

  const categories = ['3d', 'math', 'logic', 'memory', 'speed', 'word', 'strategy', 'chess'] as const;
  const catLabels: Record<string, string> = { '3d': '🪐 3D Arcade (NEW!)', math: '🧮 Math', logic: '🧩 Logic', memory: '🧠 Memory', speed: '⚡ Speed', word: '📝 Word', strategy: '♟️ Strategy', chess: '♚ Chess' };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">XP Game Store</h1>
          </div>
          <p className="mb-4 text-muted-foreground">Spend your hard-earned XP to unlock {miniGames.length} mini-games — including brand new 3D arcade titles!</p>
          {profile && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" /> Your XP: {profile.xp.toLocaleString()}
            </div>
          )}
        </motion.div>

        {categories.map(cat => {
          const games = miniGames.filter(g => g.category === cat);
          if (games.length === 0) return null;
          return (
            <div key={cat} className="mb-10">
              <h2 className="mb-4 text-lg font-bold text-foreground">
                {catLabels[cat] || cat} Games <span className="text-sm font-normal text-muted-foreground">({games.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game, i) => {
                  const owned = purchasedIds.has(game.id);
                  const c1 = game.color;
                  const c2 = game.color2 || game.color;
                  const gradient = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl p-[2px] shadow-lg transition-all hover:shadow-2xl"
                      style={{ background: gradient, boxShadow: `0 8px 30px ${c1}40` }}
                    >
                      <div className="relative rounded-[14px] bg-card/95 backdrop-blur-sm p-5 h-full flex flex-col">
                        {/* Decorative glow blob */}
                        <div
                          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
                          style={{ background: gradient }}
                        />
                        <div className="relative mb-3 flex items-center justify-between">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-md"
                            style={{ background: gradient, boxShadow: `0 4px 16px ${c1}60` }}
                          >
                            <span className="drop-shadow-md">{game.icon}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {game.is3D && (
                              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                                <Sparkles className="h-3 w-3" /> 3D
                              </span>
                            )}
                            {owned ? (
                              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">Owned ✓</span>
                            ) : (
                              <span
                                className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow"
                                style={{ background: gradient }}
                              >
                                <Zap className="h-3 w-3" /> {game.xpCost}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="relative mb-1 font-bold text-foreground">{game.name}</h3>
                        <p className="relative mb-4 flex-1 text-xs text-muted-foreground leading-relaxed">{game.description}</p>
                        {owned ? (
                          <button
                            onClick={() => navigate(game.id === 'chess' ? '/chess' : `/play/${game.id}`)}
                            className="relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
                            style={{ background: gradient, boxShadow: `0 4px 16px ${c1}60` }}
                          >
                            <Gamepad2 className="h-4 w-4" /> Play
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(game.id, game.xpCost)}
                            disabled={purchasing === game.id || !profile || profile.xp < game.xpCost}
                            className="relative flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            style={{ borderColor: c1, color: c1 }}
                          >
                            {purchasing === game.id ? '...' : <><ShoppingCart className="h-4 w-4" /> Buy for {game.xpCost} XP</>}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
