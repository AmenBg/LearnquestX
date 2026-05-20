import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowRight, Code2 } from 'lucide-react';

const CODE_SUBJECT = {
  id: 'code',
  name: 'Code',
  icon: '💻',
  color: 'hsl(130 100% 55%)',
  description: '10 programming languages • 30 lessons each • Real IDE',
};

export default function SubjectsPage() {
  const { authUser, authLoading } = useApp();
  const navigate = useNavigate();

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!authUser) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">📚 Choose a Subject</h1>
          <p className="text-muted-foreground mt-2">Select a subject to practice targeted exercises</p>
        </motion.div>

        {/* Featured: Code subject */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/code')}
          className="group mb-6 w-full overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 text-left transition-all hover:border-primary hover:scale-[1.01] shadow-[0_0_30px_rgba(130,255,150,0.1)]"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-3xl">
              <Code2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{CODE_SUBJECT.name}</h3>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">New</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{CODE_SUBJECT.description}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, i) => (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/learn/${subject.id}`)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:scale-[1.02]"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${subject.color}20` }}
              >
                {subject.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{subject.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{subject.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
