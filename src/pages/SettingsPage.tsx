import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTheme, isThemeUnlocked } from '@/contexts/ThemeContext';
import { languages, Language } from '@/lib/i18n';
import { countries } from '@/lib/countries';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Settings, Globe, LogOut, User, Palette, Lock, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, updateProfile, signOut, language, setLanguage } = useApp();
  const { themeId, setThemeId, themes } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const userXp = profile?.xp ?? 0;

  const handleLanguageChange = async (lang: Language) => {
    setSaving(true);
    setLanguage(lang);
    await updateProfile({ preferred_language: lang });
    toast.success('Language updated!');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          {/* Theme picker */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Theme</h2>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> {userXp.toLocaleString()} XP
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Pick a theme — applied site-wide. Premium themes unlock with XP.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map(theme => {
                const unlocked = isThemeUnlocked(theme, userXp);
                const active = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    disabled={!unlocked}
                    onClick={() => {
                      setThemeId(theme.id);
                      toast.success(`Theme: ${theme.name}`);
                    }}
                    className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      active ? 'border-primary ring-2 ring-primary/30' :
                      unlocked ? 'border-border hover:border-primary/40' :
                      'border-border opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{theme.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground truncate">{theme.name}</span>
                          {active && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {theme.xpRequired > 0 ? `🔒 ${theme.xpRequired.toLocaleString()} XP` : 'Free'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {theme.swatch.map((c, i) => (
                        <div key={i} className="h-5 flex-1 rounded" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{theme.description}</p>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-foreground border border-border">
                          <Lock className="h-3 w-3" /> {(theme.xpRequired - userXp).toLocaleString()} XP to unlock
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Language</h2>
            </div>
            <div className="grid gap-2">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  disabled={saving}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    language === l.code ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/20'
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-sm font-medium text-foreground">{l.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Info */}
          {profile && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Profile</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{profile.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="text-foreground">{countries.find(c => c.code === profile.country)?.name || profile.country}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Education</span><span className="text-foreground capitalize">{profile.education_level.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Grade</span><span className="text-foreground">{profile.grade}</span></div>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-3 font-semibold text-destructive transition-all hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
