"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import VNShowcase from '@/components/landing/VNShowcase';
import RoadmapSection from '@/components/landing/RoadmapSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';
import SocialProofWidget from '@/components/community/SocialProofWidget';
import ParticleBackground from '@/components/ui/ParticleBackground';
import LiveStatsTicker from '@/components/landing/LiveStatsTicker';
import MeetTheStaff from '@/components/landing/MeetTheStaff';
import MilestoneTracker from '@/components/landing/MilestoneTracker';
import { useAuth } from '@/contexts/AuthContext';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30 selection:text-white overflow-x-hidden relative">
      {/* Ambient Particle Background */}
      <ParticleBackground particleCount={40} />

      {/* Soft Radial Ambience Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/5 rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-900/5 rounded-full blur-[150px] animate-glow-pulse delay-1000" />
      </div>

      {/* Social Proof Widget */}
      <SocialProofWidget onBlogClick={() => {}} />

      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Live Ticker */}
      <LiveStatsTicker />

      <div className="max-w-7xl mx-auto px-4 z-10 relative">
        <MilestoneTracker />
      </div>

      {/* Features — Dev Highlights + Problem/Solution */}
      <FeaturesSection />

      {/* VN Showcase — Storybound Studio */}
      <VNShowcase />

      {/* Meet the Staff */}
      <MeetTheStaff />

      {/* Roadmap */}
      <RoadmapSection />

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <Footer />

      {/* Floating CTA Bar — appears on scroll */}
      <FloatingCTABar />
    </div>
  );
}

/* ─── Floating CTA Bar (bottom) ─── */
function FloatingCTABar() {
  const [show, setShow] = React.useState(false);
  const { setAuthModalOpen } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-t border-violet-500/20 p-4 transform transition-transform duration-500 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span className="font-bold text-white uppercase tracking-wider text-sm">
            v2.5.0-BETA Live
          </span>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <div className="hidden md:flex flex-col text-right mr-4">
            <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">
              Starter Pack
            </span>
            <span className="text-xl text-white font-black">
              Nuo €1.00
            </span>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-xs transition-transform hover:-translate-y-0.5"
          >
            Atrakinti
          </button>
        </div>
      </div>
    </div>
  );
}
