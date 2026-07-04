import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { signIn, signUp, getReadableAuthError } from '../firebase';
import { isValidEmail, isValidPassword, sanitizeHTML } from '../utils/validation';

export interface LoginFormProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  onModeChange,
  onSuccess,
  title = 'Otaku Network',
  subtitle = 'One account for Blog, Tracker, and Program',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters with a letter and number');
      return;
    }
    if (mode === 'signup' && displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName.trim());
      } else {
        await signIn(email, password);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const readable =
        err && typeof err === 'object' && 'code' in err
          ? getReadableAuthError(err as { code?: string; message?: string })
          : err instanceof Error
            ? err.message
            : 'Authentication failed';
      setError(sanitizeHTML(readable));
      setLoading(false);
    }
  };

  const inputWrap = 'mt-1 flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2';

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
      <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 flex gap-2 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <label className="block">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Display name</span>
            <div className={inputWrap}>
              <UserIcon className="w-4 h-4 text-gray-500" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="flex-1 bg-transparent text-white outline-none"
              />
            </div>
          </label>
        )}
        <label className="block">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Email</span>
          <div className={inputWrap}>
            <Mail className="w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="flex-1 bg-transparent text-white outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Password</span>
          <div className={inputWrap}>
            <Lock className="w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="flex-1 bg-transparent text-white outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        {mode === 'login' ? (
          <>
            No account?{' '}
            <button type="button" className="text-violet-400 hover:underline" onClick={() => onModeChange('signup')}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already registered?{' '}
            <button type="button" className="text-violet-400 hover:underline" onClick={() => onModeChange('login')}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
};
