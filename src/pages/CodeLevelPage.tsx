import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { CODE_LEVELS, getLanguage } from '@/lib/codeLessons';
import { ArrowLeft, Zap } from 'lucide-react';

export default function CodeLevelPage() {
  const { lang: langId } = useParams<{ lang: string }>();
  const lang = getLanguage(langId || '');
  const navigate = useNavigate();

  if (!lang) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">Language not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-12">
        <Link to="/code" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> All Languages
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl text-5xl mb-4"
            style={{ backgroundColor: `${lang.color}20`, border: `1px solid ${lang.color}40` }}
          >
            {lang.icon}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{lang.name}</h1>
          <p className="text-muted-foreground mt-2">Choose your starting level — lessons unlock progressively from there.</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CODE_LEVELS.map((lvl, i) => (
            <motion.button
              key={lvl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/code/${lang.id}/${lvl.id}`)}
              className="group rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/60 hover:scale-[1.02]"
              style={{ borderColor: `${lvl.color}40` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
                >
                  Level {i + 1}
                </span>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Zap className="h-3 w-3" /> ×{lvl.xpMultiplier.toFixed(2)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1" dir={lvl.id === 'beginner' || lvl.id === 'intermediate' || lvl.id === 'expert' ? 'auto' : 'ltr'}>
                {lvl.label}
              </h3>
              <p className="text-sm text-muted-foreground">{lvl.sub}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Starts at lesson {lvl.startIndex + 1} • {30 - lvl.startIndex} lessons ahead
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
