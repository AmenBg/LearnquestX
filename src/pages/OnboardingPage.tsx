import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, languages, Language } from '@/lib/i18n';
import { countries, getCountry } from '@/lib/countries';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { updateProfile, setLanguage, setIsOnboarded, authUser } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [countryCode, setCountryCode] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [grade, setGrade] = useState('');
  const [term, setTerm] = useState('');
  const [step, setStep] = useState(0);

  const country = getCountry(countryCode);
  const eduLevel = country?.educationLevels.find(e => e.id === educationLevel);

  const handleFinish = async () => {
    if (!authUser) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }
    await updateProfile({
      name: name || 'Player',
      preferred_language: lang,
      country: countryCode,
      education_level: educationLevel,
      grade,
      current_term: term,
    });
    setLanguage(lang);
    setIsOnboarded(true);
    toast.success('Welcome to LevelUp! 🚀');
    navigate('/dashboard');
  };

  const totalSteps = 6;

  const steps = [
    // Language
    <motion.div key="lang" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
    // Country
    <motion.div key="country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">🌍 Select Your Country</h2>
      <div className="grid gap-3 max-h-80 overflow-y-auto">
        {countries.map(c => (
          <button
            key={c.code}
            onClick={() => { setCountryCode(c.code); setEducationLevel(''); setGrade(''); setTerm(''); setStep(3); }}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              countryCode === c.code ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <span className="text-2xl">{c.flag}</span>
            <p className="font-semibold text-foreground">{c.name}</p>
          </button>
        ))}
      </div>
    </motion.div>,
    // Education Level
    <motion.div key="edu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">🎓 Education Level</h2>
      <div className="grid gap-3">
        {country?.educationLevels.map(level => (
          <button
            key={level.id}
            onClick={() => { setEducationLevel(level.id); setGrade(''); setStep(4); }}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              educationLevel === level.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <span className="text-2xl">{level.id === 'primary' ? '📚' : level.id === 'middle' ? '🏫' : '🎓'}</span>
            <p className="font-semibold text-foreground">{level.name}</p>
          </button>
        ))}
      </div>
    </motion.div>,
    // Grade
    <motion.div key="grade" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">📖 Select Your Grade</h2>
      <div className="grid gap-3 max-h-80 overflow-y-auto">
        {eduLevel?.grades.map(g => (
          <button
            key={g.id}
            onClick={() => { setGrade(g.id); setStep(5); }}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              grade === g.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className="font-semibold text-foreground">{g.name}</p>
          </button>
        ))}
      </div>
    </motion.div>,
    // Term
    <motion.div key="term" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h2 className="mb-6 text-xl font-bold text-foreground">📅 Current Term</h2>
      <div className="grid gap-3">
        {country?.terms.map(t => (
          <button
            key={t.id}
            onClick={() => { setTerm(t.id); }}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              term === t.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className="font-semibold text-foreground">{t.name}</p>
          </button>
        ))}
      </div>
      {term && (
        <button
          onClick={handleFinish}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow-primary"
        >
          {t('onboarding.start', lang)} 🚀
        </button>
      )}
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
          {Array.from({ length: totalSteps }).map((_, i) => (
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
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        {steps[step]}
      </div>
    </div>
  );
}
