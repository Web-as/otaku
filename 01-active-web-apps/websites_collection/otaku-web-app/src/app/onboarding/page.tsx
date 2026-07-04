"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStudio from '@/components/layout/AvatarStudio';
import { ChevronRight, CheckCircle2, Heart, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type OnboardingStep = 'WELCOME' | 'LIBRARY_INTRO' | 'SUPPORT_DEV' | 'DOWNLOAD_LAUNCHER' | 'AVATAR_INTRO' | 'AVATAR_STUDIO' | 'FINISH';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const username = user?.username || 'Adventurer';

  const nextStep = () => {
    switch (step) {
      case 'WELCOME': setStep('LIBRARY_INTRO'); break;
      case 'LIBRARY_INTRO': setStep('SUPPORT_DEV'); break;
      case 'SUPPORT_DEV': setStep('AVATAR_INTRO'); break; // Usually skipped via internal buttons
      case 'DOWNLOAD_LAUNCHER': setStep('AVATAR_INTRO'); break; // Usually skipped via internal buttons
      case 'AVATAR_INTRO': setStep('AVATAR_STUDIO'); break;
      case 'AVATAR_STUDIO': setStep('FINISH'); break;
      case 'FINISH': router.push('/app'); break;
    }
  };

  const skipToHub = () => {
    router.push('/app');
  };

  const getDialogue = () => {
    switch (step) {
      case 'WELCOME':
        return `Welcome to the Grand Archives, ${username}. I am the Librarian. Your journey into the Otaku ecosystem begins here.`;
      case 'LIBRARY_INTRO':
        return `Here, you can track every anime you watch, complete epic Quests, and share your thoughts in the public Blog.`;
      case 'SUPPORT_DEV':
        return `As a new adventurer, we invite you to support the Guild's growth. The Desktop Engine unlocks your machine's true power.`;
      case 'DOWNLOAD_LAUNCHER':
        return `Thank you for your support! Your starter Avatar Head Icon has been added to your inventory.`;
      case 'AVATAR_INTRO':
        return `Now, you must forge your digital identity. Your Avatar is how the universe will perceive you.`;
      case 'AVATAR_STUDIO':
        return `Use the Forge above to design your appearance. If you possess the Local Desktop Engine, your true visual powers will be unlocked.`;
      case 'FINISH':
        return `Your registration is complete. Welcome to the Guild. The Portal is open.`;
      default: return '';
    }
  };

  const hideSpriteAndNext = step === 'AVATAR_STUDIO' || step === 'SUPPORT_DEV' || step === 'DOWNLOAD_LAUNCHER';

  return (
    <div className="relative h-screen w-full bg-[url('https://via.placeholder.com/1920x1080/0f172a/ffffff?text=Grand+Library+Background')] bg-cover bg-center overflow-hidden flex flex-col font-sans">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Skip Button */}
      <button onClick={skipToHub} className="absolute top-6 right-6 z-50 text-gray-400 hover:text-white transition font-mono text-sm border border-gray-700 px-4 py-2 rounded-full glass hover:bg-white/10">
        Skip Tour
      </button>

      {/* Character Sprite */}
      {!hideSpriteAndNext && (
        <div className="absolute bottom-40 right-[15%] w-96 h-[600px] bg-[url('https://via.placeholder.com/400x800/transparent/ffffff?text=Librarian+Sprite')] bg-contain bg-no-repeat bg-bottom z-10 pointer-events-none transition-opacity duration-500"></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative z-20 p-10 flex flex-col justify-center items-center">
        {step === 'SUPPORT_DEV' && (
          <div className="w-full max-w-2xl glass rounded-2xl border border-violet-500/30 p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative bg-[#0a0a0f]/90 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
              Support the Desktop Engine
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Help us build the Otaku Desktop Launcher! Once completed, it will allow you to generate unlimited anime avatars using your own local machine resources—meaning zero cloud GPU costs for us and zero subscription fees for you.
              <br/><br/>
              Support the development now for <strong className="text-white">$1.00 (or €1.00)</strong> and receive a gifted <strong>Starter Avatar Icon</strong> today, plus lifetime access to the launcher and future updates at absolutely no extra fee!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => {
                  // Simulate Stripe Checkout success
                  setTimeout(() => setStep('DOWNLOAD_LAUNCHER'), 600);
                }} 
                className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.4)] transition flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" /> Support for $1.00
              </button>
              <button onClick={() => setStep('AVATAR_INTRO')} className="bg-transparent hover:bg-white/5 text-gray-400 font-bold px-8 py-3 rounded-lg border border-gray-700 transition">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 'DOWNLOAD_LAUNCHER' && (
          <div className="w-full max-w-2xl glass rounded-2xl border border-green-500/30 p-10 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative bg-[#0a0a0f]/90 flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Thank you for supporting the Otaku Guild! As a reward, we have gifted you a <strong className="text-amber-400">Starter Avatar Head Icon</strong> for your profile. 
              <br/><br/>
              The Desktop Launcher is still in active development. When it is ready, you will be able to download it here and receive all future updates at no extra fee.
            </p>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                alert("Placeholder: Download will begin when the launcher is released.");
              }}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center justify-center gap-3 w-full max-w-md mb-6"
            >
              <Download className="w-6 h-6" /> Download Launcher (Coming Soon)
            </a>
            <button onClick={() => setStep('AVATAR_INTRO')} className="text-gray-400 hover:text-white flex items-center gap-2 font-medium">
              Continue to Avatar Setup <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'AVATAR_STUDIO' && (
          <div className="w-full max-w-5xl h-[70vh] overflow-y-auto glass rounded-2xl border border-amber-500/30 p-4 shadow-2xl relative bg-black/50">
             <button onClick={nextStep} className="absolute top-6 right-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition z-50">
               Continue <ChevronRight className="w-4 h-4" />
             </button>
             <AvatarStudio />
          </div>
        )}
      </div>

      {/* Visual Novel Text Box (Bottom) */}
      <div className="relative z-30 w-full px-8 pb-8 pt-4 pointer-events-auto max-w-6xl mx-auto">
        <div className="glass p-8 rounded-xl border-t-4 border-amber-500 relative min-h-[160px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bg-black/80">
          <div className="absolute -top-5 left-8 bg-amber-500 text-black font-bold px-4 py-1 rounded-t-lg text-sm uppercase tracking-wider">
            Grand Librarian
          </div>
          
          <div className="flex flex-col h-full justify-between">
            <p className="text-xl leading-relaxed text-gray-100 font-medium">
              {getDialogue()}
            </p>
            
            <div className="flex justify-end mt-4">
              {!hideSpriteAndNext && (
                <button onClick={nextStep} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  {step === 'FINISH' ? 'Enter the Hub' : 'Next'} {step === 'FINISH' ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
