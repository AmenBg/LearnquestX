import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { CODE_LANGUAGES } from '@/lib/codeLessons';
import { Code2, ArrowLeft } from 'lucide-react';

export default function CodeHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Link to="/subjects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Subjects
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Code2 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">{'<Code/>'} Academy</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Master 10 programming languages. Real IDE. Real challenges. Earn premium XP for every lesson.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CODE_LANGUAGES.map((lang, i) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/code/${lang.id}`}
                className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/60 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(130,255,150,0.15)]"
                style={{ borderColor: `${lang.color}30` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
                    style={{ backgroundColor: `${lang.color}20`, border: `1px solid ${lang.color}40` }}
                  >
                    {lang.icon}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">.{lang.ext}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{lang.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lang.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">30 lessons</span>
                  <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    Start →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
