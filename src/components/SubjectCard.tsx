import { motion } from 'framer-motion';
import { Subject } from '@/lib/gameData';
import { Link } from 'react-router-dom';

interface SubjectCardProps {
  subject: Subject;
  index: number;
}

export default function SubjectCard({ subject, index }: SubjectCardProps) {
  const progress = (subject.completedLevels / subject.totalLevels) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/learn/${subject.id}`}
        className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:glow-primary"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-3xl">{subject.icon}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {subject.completedLevels}/{subject.totalLevels}
          </span>
        </div>
        <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors">
          {subject.name}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">{subject.description}</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-xp"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
