import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, languages, Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Settings, Globe, LogOut, User, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, updateProfile, signOut, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');

  const handleLanguageChange = async (lang: Language) => {
    setSaving(true);
    setLanguage(lang);
    await updateProfile({ preferred_language: lang });
    toast.success(lang === 'ar' ? 'تم تحديث اللغة' : lang === 'fr' ? 'Langue mise à jour' : 'Language updated!');
    setSaving(false);
  };

  const handleNameSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await updateProfile({ name: newName.trim() });
    setEditingName(false);
    toast.success('Name updated!');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success(language === 'ar' ? 'تم تسجيل الخروج' : language === 'fr' ? 'Déconnecté' : 'Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="container mx-auto max-w-lg px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('settings.title', language)}</h1>
          </div>

          {/* Profile */}
          {profile && (
            <div className="mb-4 rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">{t('settings.profile', language)}</h2>
              </div>
              <div className="flex items-center justify-between">
                {editingName ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleNameSave} disabled={saving} className="rounded-lg bg-primary p-2 text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">Level {profile.level} • {profile.xp.toLocaleString()} XP</p>
                    </div>
                    <button onClick={() => { setEditingName(true); setNewName(profile.name); }} className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Language */}
          <div className="mb-4 rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">{t('settings.language', language)}</h2>
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
                  <span className="text-lg">{l.flag}</span>
                  <span className="text-sm font-medium text-foreground">{l.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-3 font-semibold text-destructive transition-all hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" /> {t('settings.signout', language)}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
