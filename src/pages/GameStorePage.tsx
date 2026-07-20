import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { miniGames } from '@/lib/miniGames';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, Play, Swords, Castle, Shield } from 'lucide-react';

export default function GameStorePage() {
  const navigate = useNavigate();
  const game = miniGames[0]; // Kingdom Builder
  const c1 = game.color;
  const c2 = game.color2 || game.color;
  const grad = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Game Arena</h1>
          </div>
          <p className="mb-8 text-muted-foreground">
            Take a break from learning and command your very own low-poly kingdom.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl p-[2px] shadow-2xl"
          style={{ background: grad, boxShadow: `0 20px 60px ${c1}55` }}
        >
          <div className="relative rounded-[22px] bg-card/95 backdrop-blur-sm p-8 md:p-12">
            <div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: grad }}
            />
            <div
              className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ background: grad }}
            />

            <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
              <div
                className="flex h-32 w-32 items-center justify-center rounded-3xl text-7xl shadow-xl"
                style={{ background: grad, boxShadow: `0 12px 40px ${c1}70` }}
              >
                🏰
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                    <Sparkles className="h-3 w-3" /> Flagship 3D
                  </span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    Free to Play
                  </span>
                </div>
                <h2 className="mb-2 text-4xl font-black text-foreground">Kingdom Builder 3D</h2>
                <p className="mb-6 max-w-xl text-muted-foreground">
                  Raise a low-poly medieval empire, harvest XP from your academies, recruit archers,
                  knights and catapults, and defend your Town Hall against endless waves of raiders.
                </p>

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  <FeaturePill icon={<Castle className="h-4 w-4" />} label="Build & Upgrade" c={c1} />
                  <FeaturePill icon={<Swords className="h-4 w-4" />} label="Recruit Army" c={c1} />
                  <FeaturePill icon={<Shield className="h-4 w-4" />} label="Wave Defense" c={c1} />
                </div>

                <button
                  onClick={() => navigate('/kingdom')}
                  className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
                  style={{ background: grad, boxShadow: `0 8px 24px ${c1}70` }}
                >
                  <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  Enter the Kingdom
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Progress is auto-saved locally on this device.
        </p>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label, c }: { icon: React.ReactNode; label: string; c: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
      style={{ borderColor: `${c}40`, color: c, background: `${c}10` }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
