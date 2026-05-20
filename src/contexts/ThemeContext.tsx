import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { THEMES, applyTheme, getStoredThemeId, storeThemeId, isThemeUnlocked, Theme } from '@/lib/themes';

interface ThemeCtx {
  themeId: string;
  setThemeId: (id: string) => void;
  themes: Theme[];
}

const Ctx = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => getStoredThemeId());

  useEffect(() => {
    applyTheme(themeId);
    storeThemeId(themeId);
  }, [themeId]);

  return (
    <Ctx.Provider value={{ themeId, setThemeId: setThemeIdState, themes: THEMES }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme must be used within ThemeProvider');
  return c;
}

export { isThemeUnlocked };
