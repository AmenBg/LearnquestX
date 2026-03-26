import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { achievements, Achievement } from '@/lib/achievements';
import { toast } from 'sonner';

export function useAchievements(userId: string | undefined) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchUnlocked = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    if (data) setUnlockedIds(new Set(data.map(a => a.achievement_id)));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchUnlocked(); }, [fetchUnlocked]);

  const unlock = useCallback(async (achievementId: string) => {
    if (!userId || unlockedIds.has(achievementId)) return false;
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    const { error } = await supabase
      .from('user_achievements')
      .insert({ user_id: userId, achievement_id: achievementId });
    if (error) return false;

    setUnlockedIds(prev => new Set([...prev, achievementId]));

    // Award XP bonus
    if (achievement.xpReward > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('user_id', userId)
        .single();
      if (profile) {
        const newXp = profile.xp + achievement.xpReward;
        const newLevel = Math.floor(newXp / 400) + 1;
        await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('user_id', userId);
      }
    }

    toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
      description: `${achievement.description} (+${achievement.xpReward} XP)`,
    });
    return true;
  }, [userId, unlockedIds]);

  const checkAndUnlock = useCallback(async (checks: { id: string; condition: boolean }[]) => {
    for (const check of checks) {
      if (check.condition && !unlockedIds.has(check.id)) {
        await unlock(check.id);
      }
    }
  }, [unlock, unlockedIds]);

  return {
    unlockedIds,
    loading,
    unlock,
    checkAndUnlock,
    unlockedCount: unlockedIds.size,
    totalCount: achievements.length,
    getAchievement: (id: string) => achievements.find(a => a.id === id),
    isUnlocked: (id: string) => unlockedIds.has(id),
  };
}
