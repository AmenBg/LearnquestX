import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Zap, Home, BookOpen, Trophy, Menu, X, Gamepad2, Settings, LogIn, Award, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { language, profile, authUser } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.home', language), icon: Home },
    { to: '/dashboard', label: t('nav.dashboard', language), icon: Zap },
    { to: '/learn/random', label: 'Start Learning', icon: GraduationCap },
    { to: '/subjects', label: t('nav.subjects', language), icon: BookOpen },
    { to: '/store', label: 'Games', icon: Gamepad2 },
    { to: '/leaderboard', label: t('nav.leaderboard', language), icon: Trophy },
    { to: '/achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">LevelUp</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const active = location.pathname === link.to || (link.to === '/learn/random' && location.pathname.startsWith('/learn/'));
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {authUser && profile ? (
            <>
              <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold">
                <span className="text-streak">🔥</span>
                <span className="text-foreground">{profile.streak}</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                ⚡ {profile.xp.toLocaleString()} XP
              </div>
              <Link to="/settings" aria-label="Settings" className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted">
                <Settings className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden min-h-11 min-w-11 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border bg-background">
            <div className="flex flex-col gap-1 p-4">
              {links.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              {!authUser && (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground mt-2">
                  <LogIn className="h-5 w-5" /> Sign In
                </Link>
              )}
              {authUser && (
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                  <Settings className="h-5 w-5" /> Settings
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
