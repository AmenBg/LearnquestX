// Theme system — applies CSS custom properties to :root for global theming.
// Themes only override design tokens; the rest of the design system is untouched.

export interface ThemeVars {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  xpRequired: number; // 0 = free
  swatch: string[]; // for preview
  vars: ThemeVars;
}

const make = (
  bg: string, fg: string, card: string, prim: string, sec: string, acc: string,
  primFg = '240 15% 9%'
): ThemeVars => ({
  background: bg,
  foreground: fg,
  card,
  primary: prim,
  primaryForeground: primFg,
  secondary: sec,
  accent: acc,
  muted: card,
  mutedForeground: '220 10% 60%',
  border: '240 10% 22%',
  ring: prim,
});

export const THEMES: Theme[] = [
  // Free themes
  {
    id: 'neon-green', name: 'Neon Green', emoji: '🟢', description: 'The original LevelUp vibe.',
    xpRequired: 0, swatch: ['#0d1117', '#10b981', '#3b82f6', '#f59e0b'],
    vars: make('240 15% 9%', '210 40% 96%', '240 14% 12%', '130 100% 55%', '220 90% 56%', '35 100% 55%'),
  },
  {
    id: 'ocean', name: 'Ocean Deep', emoji: '🌊', description: 'Calm blues, focused mind.',
    xpRequired: 0, swatch: ['#0c2340', '#1a4a6e', '#5cbdb9', '#e0f2fe'],
    vars: make('210 50% 8%', '200 30% 95%', '210 45% 14%', '195 90% 55%', '220 80% 60%', '180 70% 55%'),
  },
  {
    id: 'sunset', name: 'Sunset Blaze', emoji: '🌅', description: 'Warm orange and magenta.',
    xpRequired: 0, swatch: ['#1a0f1f', '#ff6b35', '#f7931e', '#e84393'],
    vars: make('300 30% 10%', '30 80% 95%', '300 25% 14%', '18 95% 60%', '340 80% 60%', '40 95% 55%'),
  },
  {
    id: 'mono', name: 'Pure Mono', emoji: '⚫', description: 'High-contrast black & white.',
    xpRequired: 0, swatch: ['#000000', '#ffffff', '#a3a3a3', '#525252'],
    vars: make('0 0% 5%', '0 0% 98%', '0 0% 11%', '0 0% 95%', '0 0% 70%', '0 0% 60%', '0 0% 5%'),
  },
  {
    id: 'paper', name: 'Paper Light', emoji: '📄', description: 'Bright daylight mode.',
    xpRequired: 0, swatch: ['#f5f3ee', '#0d0d0d', '#3b82f6', '#e85d3a'],
    vars: { ...make('40 30% 95%', '0 0% 10%', '40 25% 92%', '220 90% 50%', '15 80% 55%', '270 70% 55%', '0 0% 100%'), border: '40 15% 80%', mutedForeground: '0 0% 35%' },
  },
  // XP-locked themes
  {
    id: 'cyber-magenta', name: 'Cyber Magenta', emoji: '💜', description: 'Unlock at 500 XP. Cyberpunk neon glow.',
    xpRequired: 500, swatch: ['#0d0221', '#ff00aa', '#00ffff', '#ffea00'],
    vars: make('280 60% 7%', '300 50% 96%', '280 50% 12%', '320 100% 60%', '180 100% 55%', '55 100% 55%'),
  },
  {
    id: 'royal-gold', name: 'Royal Gold', emoji: '👑', description: 'Unlock at 2,000 XP. Luxury black & gold.',
    xpRequired: 2000, swatch: ['#0a0a0a', '#c9a84c', '#f0d78c', '#fef3c7'],
    vars: make('45 20% 6%', '45 60% 92%', '45 15% 11%', '45 80% 55%', '45 60% 65%', '20 60% 50%'),
  },
  {
    id: 'crimson-elite', name: 'Crimson Elite', emoji: '🔥', description: 'Unlock at 5,000 XP. Aggressive deep red.',
    xpRequired: 5000, swatch: ['#1a0505', '#dc2626', '#fca5a5', '#fef2f2'],
    vars: make('0 60% 7%', '0 30% 96%', '0 40% 12%', '0 85% 55%', '15 90% 55%', '350 80% 60%'),
  },
];

const STORAGE_KEY = 'levelup_theme_v1';

export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return 'neon-green';
  return localStorage.getItem(STORAGE_KEY) || 'neon-green';
}

export function storeThemeId(id: string) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, id);
}

export function applyTheme(themeId: string) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  const v = theme.vars;
  root.style.setProperty('--background', v.background);
  root.style.setProperty('--foreground', v.foreground);
  root.style.setProperty('--card', v.card);
  root.style.setProperty('--card-foreground', v.foreground);
  root.style.setProperty('--popover', v.card);
  root.style.setProperty('--popover-foreground', v.foreground);
  root.style.setProperty('--primary', v.primary);
  root.style.setProperty('--primary-foreground', v.primaryForeground);
  root.style.setProperty('--secondary', v.secondary);
  root.style.setProperty('--accent', v.accent);
  root.style.setProperty('--muted', v.muted);
  root.style.setProperty('--muted-foreground', v.mutedForeground);
  root.style.setProperty('--border', v.border);
  root.style.setProperty('--input', v.border);
  root.style.setProperty('--ring', v.ring);
  root.setAttribute('data-theme', theme.id);
}

export function isThemeUnlocked(theme: Theme, xp: number): boolean {
  return theme.xpRequired === 0 || xp >= theme.xpRequired;
}
