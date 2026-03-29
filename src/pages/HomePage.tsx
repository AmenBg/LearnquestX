import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Zap, BookOpen, Trophy, Flame, ArrowRight, Gamepad2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const { language, authUser } = useApp();

  const features = [
    { icon: <Zap className="h-5 w-5 text-primary" />, title: 'Earn XP', desc: 'Gain experience from exercises and quizzes.' },
    { icon: <Flame className="h-5 w-5 text-streak" />, title: 'Daily Streaks', desc: 'Build a streak by learning every day.' },
    { icon: <Trophy className="h-5 w-5 text-secondary" />, title: 'Achievements', desc: 'Unlock badges and titles as you progress.' },
    { icon: <BookOpen className="h-5 w-5 text-accent" />, title: 'AI Exercises', desc: 'Unique questions that adapt to your level.' },
    { icon: <Gamepad2 className="h-5 w-5 text-primary" />, title: 'Game Rewards', desc: 'Unlock games as rewards for learning.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="flex min-h-[80vh] items-center justify-center pt-14">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> Learn. Play. Grow.
            </div>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-foreground md:text-6xl">
              <span className="text-gradient-primary">{t('home.title', language)}</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground">
              {t('home.subtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={authUser ? '/dashboard' : '/auth'}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary"
              >
                {authUser ? 'Dashboard' : t('home.cta', language)}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/subjects"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/30"
              >
                {t('home.cta2', language)}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {f.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
