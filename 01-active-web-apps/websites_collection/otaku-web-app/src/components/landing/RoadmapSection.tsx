"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowDownCircle, Cpu, CloudLightning, Smartphone, BrainCircuit } from 'lucide-react';
import FadeInSection from '@/components/ui/FadeInSection';
import SectionHeading from '@/components/ui/SectionHeading';

const FUTURE_UPDATES = [
  {
    quarter: "Q3 2026",
    title: "Hyper-Analyzer & Metadata",
    description: "Unified ML Analyzer (3x Speed). Deep Metadata Sync (AniList/MAL/AniDB). AI-Powered Filename Parsing.",
    icon: Cpu,
    status: "In Development",
    progress: 80,
    color: "text-green-400",
    borderHover: "hover:border-green-500/50",
  },
  {
    quarter: "Q4 2026",
    title: "Hybrid Sync & Media Intel",
    description: "Two-Tier Database (SQLite/Postgres) for conflict-free offline sync. Smart Subtitle Management & Watch Progress Tracking.",
    icon: CloudLightning,
    status: "Planning",
    progress: 45,
    color: "text-blue-400",
    borderHover: "hover:border-blue-500/50",
  },
  {
    quarter: "Q1 2027",
    title: "Mobile Command & Plugins",
    description: "Native Android/iOS Companion App for remote control. Community Plugin System for infinite extensibility.",
    icon: Smartphone,
    status: "Concept",
    progress: 15,
    color: "text-pink-400",
    borderHover: "hover:border-pink-500/50",
  },
  {
    quarter: "Q2 2027",
    title: "AI Architect & Social",
    description: "LangChain AI integration for predictive recommendations. Advanced Analytics & Guild Leaderboards.",
    icon: BrainCircuit,
    status: "Locked",
    progress: 0,
    color: "text-violet-400",
    borderHover: "hover:border-violet-500/50",
  }
];

const RoadmapSection: React.FC = () => {
  return (
    <section id="roadmap" className="py-24 bg-[#0a0a0c] relative border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection>
          <SectionHeading
            badge="Incoming Transmission"
            badgeColor="violet"
            title="Future"
            titleHighlight="Expansion"
            subtitle="One dollar buys you everything. Even the future features."
          />
        </FadeInSection>

        {/* Timeline connector (desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-[200px] bottom-[200px] w-[1px] bg-gradient-to-b from-transparent via-gray-800 to-transparent" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {FUTURE_UPDATES.map((item, idx) => (
            <FadeInSection key={idx} delay={`${idx * 150}ms`}>
              <div className={`relative p-6 bg-[#050508] border rounded-xl ${item.borderHover} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group ${
                item.status === 'Locked' ? 'opacity-50 border-gray-800/40' : 'border-gray-800/60'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gray-900 group-hover:bg-gray-800 transition-colors">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded-md border border-gray-800">
                    {item.quarter}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 mb-6 min-h-[48px] leading-relaxed">{item.description}</p>

                {/* Status badge */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-mono text-gray-600">{item.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      item.status === 'Locked' ? 'bg-gray-800' : 'bg-gradient-to-r from-violet-500 to-pink-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay="500ms">
          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center text-sm font-bold text-pink-500 uppercase tracking-widest hover:text-white transition"
            >
              Secure All Future Updates <ArrowDownCircle className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default RoadmapSection;
