"use client";

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, X, Loader2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isAuthModalOpen) return null;

  const handlePostAuthRouting = () => {
    // Smart routing based on the entry domain
    const hostname = window.location.hostname;
    
    // Future-proof routing map
    const domainRouting: Record<string, string | null> = {
      'libraryofotaku.blog': null, // Stay on the blog page
      'otakubiblioteka.lt': '/app/library', // Enter the anime tracker
      'libraryofotaku.net': '/app', // Enter the main community hub
      'localhost': '/app', // Default for local dev
    };

    const targetRoute = domainRouting[hostname];
    
    // If a specific route exists for this domain, go there.
    // Otherwise, just stay on the current page (e.g., blog)
    if (targetRoute !== undefined && targetRoute !== null) {
      router.push(targetRoute);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        setAuthModalOpen(false);
        handlePostAuthRouting();
      } else {
        await register(username, email, password);
        setAuthModalOpen(false);
        handlePostAuthRouting();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md relative animate-in zoom-in slide-in-from-bottom-8">
        
        {/* Close Button */}
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute -top-12 right-0 text-gray-500 hover:text-white transition p-2 bg-gray-900 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-violet-900/20">
          
          {/* Logo */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/20">
              <ShieldCheck className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Universal Access'}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-mono">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Register once. Access the entire ecosystem.'}
            </p>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,92,246,0.03)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />
          
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Otaku_Master"
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
                  placeholder="name@example.com"
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
                  {mode === 'login' ? 'Authenticating...' : 'Registering...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Join the Ecosystem'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center relative z-10 mb-6">
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

          {/* Support Section */}
          <div className="bg-[#050505]/80 p-6 -mx-8 -mb-8 border-t border-white/5 text-center relative z-10">
            <div className="inline-flex items-center justify-center space-x-2 text-amber-400 mb-3 font-mono text-sm uppercase">
              <Heart className="w-4 h-4 fill-current" />
              <span>Support the Project</span>
            </div>
            <p className="text-xs text-gray-400 mb-4 px-2">
              Want to help us build faster? Donate via PayPal to secure an exclusive <strong className="text-violet-400">"Early Supporter"</strong> badge and a premium profile banner when we launch!
            </p>
            <a 
              href="https://paypal.me/YOUR_PAYPAL_LINK" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full py-3 bg-[#00457C] hover:bg-[#005ea6] text-white font-bold rounded-lg transition-colors border border-[#0079C1]/50 text-sm"
            >
              Donate via PayPal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
