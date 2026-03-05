import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  glowClass?: string;
}

export default function StatCard({ icon, label, value, glowClass = 'glow-primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border border-border bg-card p-5 ${glowClass}`}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
