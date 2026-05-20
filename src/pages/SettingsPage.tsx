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
