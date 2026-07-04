"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        router.push('/app/library');
      } else {
        await register(username, email, password);
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-anime-grid opacity-5" />
      </div>

      {/* Back to home */}
      <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-500 hover:text-white transition text-sm font-mono z-20">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/20">
            <ShieldCheck className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join the Guild'}
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-mono">
            {mode === 'login' ? 'Enter your credentials to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle Shimmer for Auth Card */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.03)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="GuildMaster_42"
                    className="w-full bg-[#050505]/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:border-violet-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] outline-none font-mono text-sm placeholder-gray-600 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="otaku@nexus.lt"
                  className="w-full bg-[#050505]/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:border-violet-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] outline-none font-mono text-sm placeholder-gray-600 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050505]/50 border border-gray-700 text-white pl-10 pr-12 py-3 rounded-lg focus:border-violet-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.3)] outline-none font-mono text-sm placeholder-gray-600 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-lg shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="text-sm text-gray-500 hover:text-violet-400 transition"
            >
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span className="font-bold text-violet-400 hover:text-violet-300">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-6">
          Secure Authentication • Encrypted Data • GDPR Compliant
        </p>
      </div>
    </div>
  );
}
