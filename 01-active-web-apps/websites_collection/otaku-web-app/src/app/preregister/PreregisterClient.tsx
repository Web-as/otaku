"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { ShieldCheck, Zap, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useSearchParams } from 'next/navigation';

interface Props {
  initialEmailCount: number;
  initialSupporterCount: number;
}

function PreregisterForm({ initialEmailCount, initialSupporterCount }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasEarlyAccess, setHasEarlyAccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle Stripe redirect parameters
    if (searchParams?.get('success') === 'true') {
      const tier = searchParams.get('tier');
      if (tier === 'card_holder' || tier === 'program') {
        // Set early access cookie for 1 year
        document.cookie = "early_access_unlocked=true; path=/; max-age=31536000;";
        setHasEarlyAccess(true);
        setErrorMessage('Payment successful! You now have Early Access. Please log in or sign up to enter the site.');
      }
    }
    if (searchParams?.get('canceled') === 'true') {
      setStatus('error');
      setErrorMessage('Checkout was canceled.');
    }
    
    // Check cookie on mount
    if (document.cookie.includes('early_access_unlocked=true')) {
      setHasEarlyAccess(true);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleStripeCheckout = async (tier: 'program' | 'card_holder') => {
    // We will implement Stripe integration in the next step
    window.location.href = `/api/checkout/preregister?tier=${tier}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30 selection:text-white overflow-x-hidden relative">
      <ParticleBackground particleCount={30} />
      
      {/* Soft Radial Ambience Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-900/10 rounded-full blur-[150px] animate-glow-pulse delay-1000" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold uppercase tracking-widest backdrop-blur-md mb-4">
            <Zap className="w-4 h-4" />
            <span>Currently In Development</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
              Anime Platform
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We are building Otaku Gildija from the ground up. Pre-register your email to get notified when we launch, or support the build now to unlock exclusive early access.
          </p>

          {/* Live Counters */}
          <div className="flex items-center justify-center space-x-8 pt-6">
            <div className="text-center">
              <div className="text-4xl font-black text-white">{initialEmailCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-mono mt-1">Waitlist</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{initialSupporterCount}</div>
              <div className="text-xs text-green-500/50 uppercase tracking-widest font-mono mt-1">Supporters</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Free Email Registration */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Join the Waitlist</h3>
            <p className="text-gray-400 text-sm mb-8">
              Get an email when we officially launch. No spam, ever.
            </p>

            <form onSubmit={handleEmailSubmit} className="mt-auto space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-gray-600 transition-all"
                  required
                />
              </div>
              
              {status === 'error' && (
                <div className="text-red-400 text-sm">{errorMessage}</div>
              )}
              {status === 'success' && (
                <div className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> You're on the list!
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? 'Saving...' : 'Pre-register for Free'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Support the Build */}
          <div className="relative bg-gradient-to-b from-violet-600/20 to-black backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 flex flex-col">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                Early Access
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-violet-100">Support the Build</h3>
            <p className="text-violet-200/70 text-sm mb-6">
              Help us build Otaku Gildija faster. Get instant access to the beta site today.
            </p>

            <div className="space-y-4 mt-auto">
              {hasEarlyAccess ? (
                <div className="bg-black/40 border border-green-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="text-green-400 flex items-center gap-2 font-bold mb-2">
                    <CheckCircle2 className="w-5 h-5" /> Early Access Granted!
                  </div>
                  <a 
                    href="/api/download-launcher"
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-bold rounded-md transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                  >
                    Download Desktop Launcher
                  </a>
                  <a 
                    href="/app/library"
                    className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    Enter Web App <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <>
                  {/* Option 1: Program Download */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-white">Program Launch</div>
                      <div className="text-xs text-gray-400">One-time payment</div>
                    </div>
                    <button 
                      onClick={() => handleStripeCheckout('program')}
                      className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-md transition-colors whitespace-nowrap"
                    >
                      €1.00
                    </button>
                  </div>

              {/* Option 2: Card Holder */}
              <div className="bg-violet-900/40 border border-violet-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    Card Holder
                  </div>
                  <div className="text-xs text-violet-300">
                    Pay now, get <span className="font-bold text-white">free months</span> after launch!
                  </div>
                </div>
                <button 
                  onClick={() => handleStripeCheckout('card_holder')}
                  className="relative z-10 w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-bold rounded-md transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] whitespace-nowrap"
                >
                  €2.50 / mo
                  </button>
                </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PreregisterClient(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>}>
      <PreregisterForm {...props} />
    </Suspense>
  );
}
