"use client";
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, FileCheck, Globe, ChevronRight, Terminal, Server, Sparkles, Rocket } from 'lucide-react';
import FadeInSection from '@/components/ui/FadeInSection';
import SectionHeading from '@/components/ui/SectionHeading';

const DEV_ACHIEVEMENTS = [
  {
    title: "File Organizer Core v2.0",
    category: "Engineering",
    description: "Architecture restructuring 100% complete. Features transactional undo system, unified launcher, and real-time performance monitoring.",
    icon: Terminal,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgGlow: "from-violet-600/10",
    hoverBorder: "hover:border-violet-500",
  },
  {
    title: "Anime Library API Live",
    category: "Backend",
    description: "Production-ready FastAPI with 52+ endpoints. Supports real-time WebSockets, batch operations, and advanced library statistics.",
    icon: Server,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgGlow: "from-blue-600/10",
    hoverBorder: "hover:border-blue-500",
  },
  {
    title: "AI Visual Intelligence",
    category: "AI / ML",
    description: "Gemini 2.0 integration active. Generates anime-style art, processes thumbnails, and extracts metadata automatically.",
    icon: Sparkles,
    color: "text-pink-400",
    borderColor: "border-pink-500/40",
    bgGlow: "from-pink-600/10",
    hoverBorder: "hover:border-pink-500",
  },
  {
    title: "Unified System Launch",
    category: "Release",
    description: "Integrated CLI, GUI, and Web modes into a single executable. Database schema finalized with automatic migrations.",
    icon: Rocket,
    color: "text-green-400",
    borderColor: "border-green-500/40",
    bgGlow: "from-green-600/10",
    hoverBorder: "hover:border-green-500",
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <>
      {/* Dev Highlights */}
      <section className="relative py-24 bg-[#050505] border-b border-gray-800/50" id="features">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <SectionHeading
                badge="DevLog Feed"
                badgeColor="yellow"
                title="Development"
                titleHighlight="Highlights"
                subtitle="Engineering milestones achieved for v2.5.0-BETA."
                centered={false}
                className="mb-0"
              />
              <Link
                href="/blog"
                className="hidden md:flex items-center text-xs font-bold uppercase tracking-widest text-violet-400 hover:text-white transition mt-4 md:mt-0"
              >
                Read All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-6">
            {DEV_ACHIEVEMENTS.map((post, idx) => (
              <FadeInSection key={idx} delay={`${idx * 100}ms`}>
                <Link href="/blog" className="block group">
                  <div className={`relative bg-[#0a0a0c] rounded-xl overflow-hidden border border-gray-800/60 ${post.hoverBorder} transition-all duration-300 h-full flex flex-col`}>
                    {/* Top gradient line */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${post.bgGlow} to-transparent opacity-60`} />
                    
                    <div className="p-6 relative z-10 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 bg-gray-900 text-[10px] font-bold uppercase ${post.color} rounded-md border border-gray-800`}>
                          {post.category}
                        </span>
                        <post.icon className={`w-5 h-5 ${post.color} opacity-60 group-hover:opacity-100 transition`} />
                      </div>
                      <h3 className={`text-xl font-bold text-white mb-3 group-hover:${post.color} transition`}>
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                        {post.description}
                      </p>
                    </div>
                    <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-800/50 flex justify-between items-center group-hover:bg-gray-900/60 transition">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">View Report</span>
                      <ChevronRight className={`w-4 h-4 ${post.color} transform group-hover:translate-x-1 transition`} />
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-[#0a0a0c] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <SectionHeading
                  badge="Warning: Data Corruption"
                  badgeColor="red"
                  title="Your Library is"
                  titleHighlight="Bleeding Out."
                  centered={false}
                  className="mb-6"
                />
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  Scattered hard drives. Mismatched subtitles. &quot;Unknown_Episode_05.mkv&quot;. You spend more time organizing than watching.
                  Your watch history is trapped on one device.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500 shrink-0" /> No Backup</li>
                  <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500 shrink-0" /> Manual Renaming</li>
                  <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500 shrink-0" /> Duplicate Files</li>
                </ul>
              </div>
              <div className="flex-1 relative">
                <div className="bg-[#0a0a0c] border border-red-900/30 rounded-xl p-6 font-mono text-xs text-red-300/70 leading-relaxed">
                  &gt; Error: File not found<br/>
                  &gt; Warning: Metadata missing for 420 items<br/>
                  &gt; Critical: Sync failed<br/>
                  &gt; [folder_new_final_v2] contains 15GB of duplicates...
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent rounded-xl" />
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-[#050505] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection delay="200ms">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <SectionHeading
                  badge="System Restored"
                  badgeColor="green"
                  title="Enter The"
                  titleHighlight="Guild Protocol."
                  centered={false}
                  className="mb-6"
                />
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  One click. That&apos;s all it takes. The Autosorter Core scans, identifies, and renames your entire 10TB collection in seconds.
                  Sync progress to the cloud. Unlock badges.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500 shrink-0" /> Auto-Renaming</li>
                  <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500 shrink-0" /> 4K HDR Analysis</li>
                  <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500 shrink-0" /> Cloud Sync</li>
                </ul>
                <Link
                  href="/pricing"
                  className="mt-8 inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5"
                >
                  Open in Browser <Globe className="w-4 h-4 ml-2" />
                </Link>
              </div>
              <div className="flex-1 relative">
                <div className="bg-[#0a0a0c] border border-green-500/20 rounded-xl p-6 font-mono text-xs text-green-400 leading-relaxed">
                  &gt; Scan Complete.<br/>
                  &gt; 14,205 Files Optimized.<br/>
                  &gt; 0 Duplicates Found.<br/>
                  &gt; Uploading to Cloud... [100%]<br/>
                  &gt; Welcome back, Guild Master.
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
