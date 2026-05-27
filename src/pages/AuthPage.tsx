import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const { signUp, signIn } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify.');
        navigate('/onboarding');
      }
    }
    setLoading(false);
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
            {isLogin ? 'Welcome Back' : 'Join LevelUp'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to continue your adventure' : 'Create your account and start learning'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                className="w-full rounded-xl border border-border bg-muted pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                required
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 glow-primary"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 font-semibold text-primary hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
