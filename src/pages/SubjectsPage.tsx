import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { subjects } from '@/lib/gameData';
import Navbar from '@/components/Navbar';
import SubjectCard from '@/components/SubjectCard';
import { motion } from 'framer-motion';

export default function SubjectsPage() {
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-3xl font-bold text-foreground">{t('subjects.title', language)}</h1>
          <p className="mb-8 text-muted-foreground">Pick a subject and start leveling up!</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((s, i) => (
            <SubjectCard key={s.id} subject={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
