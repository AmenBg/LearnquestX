import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Email or password is incorrect. Please try again.';
  }
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('email') && m.includes('invalid')) {
    return 'That email address looks invalid. Please double-check it.';
  }
  if (m.includes('password') && (m.includes('short') || m.includes('6'))) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('pwned') || m.includes('leaked')) {
    return 'This password has appeared in a known data breach. Please choose a stronger one.';
  }
  if (m.includes('rate') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Network issue. Please check your connection and try again.';
  }
  return 'Something went wrong. Please try again in a moment.';
}

const SIGNUP_STAGES = [
  'Creating your account…',
  'Setting up your profile…',
  'Preparing your dashboard…',
  'Welcome to LearnQuest…',
];

export default function AuthPage() {
  const { signUp, signIn, authUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  // Only allow same-origin relative paths as redirect targets.
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;
  const redirectTarget = nextPath ?? '/dashboard';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);

  // If already signed in, go to the intended destination (or dashboard).
  useEffect(() => {
    if (authUser) {
      if (nextPath) window.location.href = nextPath;
      else navigate('/dashboard', { replace: true });
    }
  }, [authUser, navigate, nextPath]);

  // Cycle loading stages during signup
  useEffect(() => {
    if (!loading || isLogin) return;
    setStage(0);
    const id = setInterval(() => {
      setStage(s => Math.min(s + 1, SIGNUP_STAGES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [loading, isLogin]);

  const validate = (): string | null => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!isLogin) {
      const trimmed = name.trim();
      if (trimmed.length < 2) return 'Please enter a username (at least 2 characters).';
      if (trimmed.length > 30) return 'Username must be 30 characters or fewer.';
      if (!/^[\p{L}\p{N}_\-\s.]+$/u.test(trimmed)) {
        return 'Username can only contain letters, numbers, spaces, dots, dashes, and underscores.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const v = validate();
    if (v) { toast.error(v); return; }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) { toast.error(friendlyError(error.message)); return; }
        toast.success('Welcome back!');
        if (nextPath) window.location.href = nextPath;
        else navigate(redirectTarget, { replace: true });
      } else {
        const { data, error } = await signUp(email.trim(), password, name.trim());
        if (error) { toast.error(friendlyError(error.message)); return; }
        if (!data?.session) {
          const { error: signInErr } = await signIn(email.trim(), password);
          if (signInErr) {
            toast.success('Account created! Please sign in to continue.');
            setIsLogin(true);
            return;
          }
        }
        toast.success('Welcome to LearnQuest! 🚀');
        if (nextPath) window.location.href = nextPath;
        else navigate(redirectTarget, { replace: true });
      }
    } catch (err: any) {
      toast.error(friendlyError(err?.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Join LearnQuest'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to continue your adventure' : 'Create your account in seconds'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Username"
                aria-label="Username"
                autoComplete="username"
                maxLength={30}
                className="w-full rounded-xl border border-border bg-muted pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-muted pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border border-border bg-muted pl-11 pr-11 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              required
              minLength={6}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-70 glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isLogin ? 'login' : `signup-${stage}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isLogin ? 'Signing you in…' : SIGNUP_STAGES[stage]}
                  </motion.span>
                </AnimatePresence>
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => !loading && setIsLogin(!isLogin)}
            className="ml-1 font-semibold text-primary hover:underline disabled:opacity-50"
            disabled={loading}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
