import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (!error) await fetchProfile();
    return error;
  };

  const addXp = async (amount: number) => {
    if (!profile) return;
    const newXp = profile.xp + amount;
    const newLevel = Math.floor(newXp / 400) + 1;
    await updateProfile({ xp: newXp, level: newLevel, last_activity_date: new Date().toISOString().split('T')[0] });
  };

  return { profile, loading, updateProfile, addXp, refetch: fetchProfile };
}
