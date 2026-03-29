import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { languages, Language } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const stepLabels: Record<string, { langTitle: string; nameTitle: string; namePlaceholder: string; next: string; start: string }> = {
  en: { langTitle: 'Choose Your Language', nameTitle: 'What\'s Your Name?', namePlaceholder: 'Enter your name...', next: 'Next', start: 'Start Learning 🚀' },
  ar: { langTitle: 'اختر لغتك', nameTitle: 'ما اسمك؟', namePlaceholder: 'أدخل اسمك...', next: 'التالي', start: 'ابدأ التعلم 🚀' },
  fr: { langTitle: 'Choisissez votre langue', nameTitle: 'Quel est votre nom ?', namePlaceholder: 'Entrez votre nom...', next: 'Suivant', start: 'Commencer 🚀' },
};

export default function OnboardingPage() {
  const { updateProfile, setLanguage, setIsOnboarded, authUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const preferredLang = (location.state as any)?.preferredLang;

  const [name, setName] = useState('');
  const [lang, setLang] = useState<Language>(preferredLang || 'en');
  const [step, setStep] = useState(0);

  const supportedLangs = languages.filter(l => ['en', 'ar', 'fr'].includes(l.code));
  const labels = stepLabels[lang] || stepLabels.en;

  const handleFinish = async () => {
    if (!authUser) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }
    await updateProfile({
      name: name.trim() || 'Player',
      preferred_language: lang,
      country: 'TN',
      education_level: 'middle_school',
      grade: '7',
      current_term: 'term_1',
    });
    setLanguage(lang);
    setIsOnboarded(true);
    toast.success(lang === 'ar' ? 'مرحباً بك! 🚀' : lang === 'fr' ? 'Bienvenue ! 🚀' : 'Welcome to LevelUp! 🚀');
    navigate('/dashboard');
  };

  const steps = [
    // Step 0: Language
    <motion.div key="lang" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">{labels.langTitle}</h2>
      <div className="grid gap-3">
        {supportedLangs.map(l => (
          <button
            key={l.code}
            onClick={() => { setLang(l.code); setTimeout(() => setStep(1), 200); }}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              lang === l.code ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <span className="text-2xl">{l.flag}</span>
            <div>
              <p className="font-semibold text-foreground">{l.nativeName}</p>
              <p className="text-xs text-muted-foreground">{l.name}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Name
    <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">{labels.nameTitle}</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={labels.namePlaceholder}
        className="mb-6 w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        maxLength={50}
        autoFocus
      />
      <button
        onClick={handleFinish}
        disabled={!name.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50 glow-primary"
      >
        {labels.start}
      </button>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === 'ar' ? 'رجوع' : lang === 'fr' ? 'Retour' : 'Back'}
          </button>
        )}

        {steps[step]}
      </div>
    </div>
  );
}
