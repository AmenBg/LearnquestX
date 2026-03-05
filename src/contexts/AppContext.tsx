import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/lib/i18n';

interface UserProfile {
  name: string;
  age: number;
  language: Language;
  xp: number;
  level: number;
  streak: number;
}

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>({
    name: 'Player',
    age: 14,
    language: 'en',
    xp: 8750,
    level: 25,
    streak: 12,
  });
  const [language, setLanguage] = useState<Language>('en');
  const [isOnboarded, setIsOnboarded] = useState(true);

  return (
    <AppContext.Provider value={{ user, setUser, language, setLanguage, isOnboarded, setIsOnboarded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
