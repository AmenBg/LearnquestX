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
  swatch: string[];
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
  // ===== Free themes (Exactly 4) =====
  {
    id: 'neon-green', name: 'Neon Green', emoji: '🟢', description: 'The original LevelUp vibe.',
    xpRequired: 0, swatch: ['#0d1117', '#10b981', '#3b82f6', '#f59e0b'],
    vars: make('240 15% 9%', '210 40% 96%', '240 14% 12%', '130 100% 55%', '220 90% 56%', '35 100% 55%'),
  },
  {
    id: 'ocean-blue', name: 'Ocean Blue', emoji: '🌊', description: 'Calm deep-sea blues.',
    xpRequired: 0, swatch: ['#0c2340', '#1a4a6e', '#5cbdb9', '#e0f2fe'],
    vars: make('210 50% 8%', '200 30% 95%', '210 45% 14%', '195 90% 55%', '220 80% 60%', '180 70% 55%'),
  },
  {
    id: 'midnight-purple', name: 'Midnight Purple', emoji: '🌌', description: 'Deep cosmic violets.',
    xpRequired: 0, swatch: ['#1a0a2e', '#7c3aed', '#a855f7', '#f0abfc'],
    vars: make('270 50% 8%', '280 30% 95%', '270 40% 14%', '270 90% 65%', '290 80% 65%', '320 80% 70%'),
  },
  {
    id: 'minimal-black', name: 'Minimal Black', emoji: '⚫', description: 'Pure mono — high contrast.',
    xpRequired: 0, swatch: ['#000000', '#ffffff', '#a3a3a3', '#525252'],
    vars: make('0 0% 5%', '0 0% 98%', '0 0% 11%', '0 0% 95%', '0 0% 70%', '0 0% 60%', '0 0% 5%'),
  },

  // ===== Locked XP themes (13 Locked Themes) =====
  {
    id: 'arctic-white', name: 'Arctic White', emoji: '❄️', description: 'Bright, icy daylight.',
    xpRequired: 150, swatch: ['#f5f7fa', '#0d0d0d', '#3b82f6', '#22d3ee'],
    vars: { ...make('210 30% 96%', '220 30% 12%', '210 25% 92%', '220 90% 55%', '195 90% 50%', '270 70% 55%', '0 0% 100%'), border: '210 15% 80%', mutedForeground: '220 15% 35%' },
  },
  {
    id: 'cyber-cyan', name: 'Cyber Cyan', emoji: '🔷', description: 'Glowing cyan circuitry.',
    xpRequired: 450, swatch: ['#021420', '#06b6d4', '#67e8f9', '#fb7185'],
    vars: make('195 70% 6%', '190 30% 95%', '195 60% 12%', '185 100% 50%', '195 100% 60%', '340 90% 65%'),
  },
  {
    id: 'dark-orange', name: 'Dark Orange', emoji: '🔥', description: 'Charcoal with ember accents.',
    xpRequired: 850, swatch: ['#1a1a1a', '#f97316', '#fb923c', '#facc15'],
    vars: make('20 15% 8%', '30 30% 95%', '20 15% 13%', '24 95% 55%', '35 90% 60%', '45 95% 55%'),
  },
  {
    id: 'rose-pink', name: 'Rose Pink', emoji: '🌸', description: 'Soft rose with pink glow.',
    xpRequired: 1400, swatch: ['#1f0a14', '#ec4899', '#f9a8d4', '#fb7185'],
    vars: make('330 40% 8%', '320 30% 95%', '330 30% 14%', '330 90% 65%', '340 85% 65%', '15 90% 65%'),
  },
  {
    id: 'electric-lime', name: 'Electric Lime', emoji: '⚡', description: 'High-voltage lime energy.',
    xpRequired: 2100, swatch: ['#0a1a05', '#84cc16', '#bef264', '#22d3ee'],
    vars: make('90 40% 6%', '80 30% 95%', '90 30% 12%', '80 90% 55%', '160 80% 50%', '180 90% 55%'),
  },
  {
    id: 'soft-violet', name: 'Soft Violet', emoji: '💜', description: 'Gentle lavender mood.',
    xpRequired: 2800, swatch: ['#1a1530', '#8b5cf6', '#c4b5fd', '#a78bfa'],
    vars: make('260 30% 12%', '270 30% 95%', '260 25% 17%', '260 85% 70%', '270 75% 70%', '280 80% 75%'),
  },
  {
    id: 'sunset-blaze', name: 'Sunset Blaze', emoji: '🌅', description: 'Orange to magenta horizon.',
    xpRequired: 3500, swatch: ['#1a0f1f', '#ff6b35', '#f7931e', '#e84393'],
    vars: make('300 30% 10%', '30 80% 95%', '300 25% 14%', '18 95% 60%', '340 80% 60%', '40 95% 55%'),
  },
  {
    id: 'forest-deep', name: 'Forest Deep', emoji: '🌲', description: 'Mossy greens, grounded calm.',
    xpRequired: 4200, swatch: ['#0a1f14', '#22c55e', '#86efac', '#fbbf24'],
    vars: make('150 40% 7%', '140 25% 95%', '150 30% 13%', '140 70% 50%', '160 60% 55%', '45 90% 55%'),
  },
  {
    id: 'galaxy-core', name: 'Galaxy Core', emoji: '🌠', description: 'Nebula gradients & deep space.',
    xpRequired: 5600, swatch: ['#0a0a2e', '#6366f1', '#a78bfa', '#22d3ee'],
    vars: make('245 60% 9%', '250 40% 96%', '245 45% 14%', '245 90% 65%', '270 85% 70%', '190 95% 60%'),
  },
  {
    id: 'lava-inferno', name: 'Lava Inferno', emoji: '🌋', description: 'Molten reds & smoldering blacks.',
    xpRequired: 7000, swatch: ['#1a0505', '#dc2626', '#f97316', '#fde047'],
    vars: make('0 60% 7%', '20 40% 96%', '0 50% 12%', '0 85% 55%', '20 95% 55%', '45 95% 60%'),
  },
  {
    id: 'matrix-code', name: 'Matrix Code', emoji: '💻', description: 'Terminal green on jet black.',
    xpRequired: 10500, swatch: ['#000000', '#00ff41', '#008f11', '#003b00'],
    vars: make('120 100% 3%', '120 100% 75%', '120 80% 8%', '130 100% 50%', '130 80% 40%', '130 100% 60%', '0 0% 0%'),
  },
  {
    id: 'royal-gold', name: 'Royal Gold', emoji: '👑', description: 'Luxury black & gold elegance.',
    xpRequired: 14000, swatch: ['#0a0a0a', '#c9a84c', '#f0d78c', '#fef3c7'],
    vars: make('45 20% 6%', '45 60% 92%', '45 15% 11%', '45 80% 55%', '45 60% 65%', '20 60% 50%'),
  },
  {
    id: 'crimson-elite', name: 'Crimson Elite', emoji: '👹', description: 'Dark blood red & obsidian.',
    xpRequired: 21000, swatch: ['#0f0303', '#e11d48', '#f43f5e', '#ffffff'],
    vars: make('350 60% 6%', '350 40% 96%', '350 50% 10%', '345 85% 50%', '350 75% 60%', '0 0% 100%'),
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
  
  root.style.transition = 'background-color 0.4s ease, color 0.4s ease';
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