import heroBg from '@/assets/hero-bg.jpg';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Zap, BookOpen, Trophy, Flame, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const { language } = useApp();

  const features = [
    { icon: <Zap className="h-6 w-6 text-primary" />, title: 'Earn XP', desc: 'Gain experience points with every lesson and quiz you complete.' },
    { icon: <Flame className="h-6 w-6 text-streak" />, title: 'Daily Streaks', desc: 'Build a streak by learning every day. Don\'t break the chain!' },
    { icon: <Trophy className="h-6 w-6 text-secondary" />, title: 'Leaderboards', desc: 'Compete with learners around the world and climb the ranks.' },
    { icon: <BookOpen className="h-6 w-6 text-level-glow" />, title: '200+ Levels', desc: 'Each subject has 200 levels of progressively harder content.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" /> Gamified Learning Platform
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-7xl">
              {t('home.title', language).split(' ').map((word, i) => (
                <span key={i} className={i === 0 || i === 1 ? 'text-gradient-primary' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              {t('home.subtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary"
              >
                {t('home.cta', language)}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/subjects"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary/30"
              >
                {t('home.cta2', language)}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {f.icon}
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
