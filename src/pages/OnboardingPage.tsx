import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, languages, Language } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { setUser, setLanguage, setIsOnboarded } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [step, setStep] = useState(0);

  const handleStart = () => {
    setUser({
      name: name || 'Player',
      age: parseInt(age) || 14,
      language: lang,
      xp: 0,
      level: 1,
      streak: 0,
    });
    setLanguage(lang);
    setIsOnboarded(true);
    navigate('/dashboard');
  };

  const steps = [
    // Language
    <motion.div key="lang" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('onboarding.language', lang)}</h2>
      <div className="grid gap-3">
        {languages.map(l => (
          <button
            key={l.code}
            onClick={() => { setLang(l.code); setStep(1); }}
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
    // Name
    <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('onboarding.name', lang)}</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name..."
        className="mb-4 w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        maxLength={50}
      />
      <button
        onClick={() => setStep(2)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
      >
        Next <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>,
    // Age
    <motion.div key="age" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">{t('onboarding.age', lang)}</h2>
      <input
        type="number"
        value={age}
        onChange={e => setAge(e.target.value)}
        placeholder="Enter your age..."
        min={5}
        max={99}
        className="mb-4 w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <button
        onClick={handleStart}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow-primary"
      >
        {t('onboarding.start', lang)} 🚀
      </button>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('onboarding.title', lang)}</h1>
        </motion.div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {steps[step]}
      </div>
    </div>
  );
}
