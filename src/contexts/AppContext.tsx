import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AppContextType {
  // Auth
  authUser: ReturnType<typeof useAuth>['user'];
  session: ReturnType<typeof useAuth>['session'];
  authLoading: boolean;
  signUp: ReturnType<typeof useAuth>['signUp'];
  signIn: ReturnType<typeof useAuth>['signIn'];
  signOut: ReturnType<typeof useAuth>['signOut'];
  // Profile
  profile: Profile | null;
  profileLoading: boolean;
  updateProfile: ReturnType<typeof useProfile>['updateProfile'];
  addXp: ReturnType<typeof useProfile>['addXp'];
  refetchProfile: ReturnType<typeof useProfile>['refetch'];
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  // Onboarding
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { profile, loading: profileLoading, updateProfile, addXp, refetch: refetchProfile } = useProfile(auth.user?.id);
  const [language, setLanguage] = useState<Language>('en');
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Sync language from profile
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language as Language);
    }
  }, [profile?.preferred_language]);

  // Onboarding: every account collects a name at signup, so a profile means onboarded.
  useEffect(() => {
    if (profile) setIsOnboarded(true);
  }, [profile]);


  return (
    <AppContext.Provider value={{
      authUser: auth.user,
      session: auth.session,
      authLoading: auth.loading,
      signUp: auth.signUp,
      signIn: auth.signIn,
      signOut: auth.signOut,
      profile,
      profileLoading,
      updateProfile,
      addXp,
      refetchProfile,
      language,
      setLanguage,
      isOnboarded,
      setIsOnboarded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
