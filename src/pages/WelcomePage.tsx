import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { languages, Language } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { ArrowRight, Globe } from 'lucide-react';

const welcomeText: Record<string, { title: string; message: string; cta: string }> = {
  en: {
    title: 'Welcome to LevelUp',
    message: 'This platform is not designed to follow traditional school systems.\nIt is designed to help you learn while enjoying the experience like a game.\nThis is our first version, and we hope you enjoy it.',
    cta: 'Continue',
  },
  ar: {
    title: 'مرحباً بك في LevelUp',
    message: 'هذه المنصة ليست مصممة لتتبع الأنظمة المدرسية التقليدية.\nهي مصممة لمساعدتك على التعلم مع الاستمتاع بالتجربة كأنها لعبة.\nهذه نسختنا الأولى، ونأمل أن تستمتع بها.',
    cta: 'متابعة',
  },
  fr: {
    title: 'Bienvenue sur LevelUp',
    message: "Cette plateforme n'est pas conçue pour suivre les systèmes scolaires traditionnels.\nElle est conçue pour vous aider à apprendre tout en profitant de l'expérience comme un jeu.\nC'est notre première version, et nous espérons que vous l'apprécierez.",
    cta: 'Continuer',
  },
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('en');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const supportedLangs = languages.filter(l => ['en', 'ar', 'fr'].includes(l.code));
  const text = welcomeText[lang] || welcomeText.en;

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language switcher - top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition-all hover:border-primary/30"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          {supportedLangs.find(l => l.code === lang)?.flag}
        </button>
        {showLangPicker && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg"
          >
            {supportedLangs.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all ${
                  lang === l.code ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{l.flag}</span>
                <span className="font-medium">{l.nativeName}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Centered welcome message */}
      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg text-center"
        >
          <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
            {text.title}
          </h1>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {text.message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom-left arrow button */}
      <div className="p-6">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate('/auth', { state: { preferredLang: lang } })}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all hover:scale-110 active:scale-95 glow-primary"
        >
          <ArrowRight className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}
