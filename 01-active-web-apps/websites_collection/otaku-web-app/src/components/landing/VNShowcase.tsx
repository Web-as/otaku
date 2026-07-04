"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Play, BookOpen, Dice5, Scroll, Brain, Swords, ArrowRight } from 'lucide-react';
import FadeInSection from '@/components/ui/FadeInSection';
import SectionHeading from '@/components/ui/SectionHeading';

const DEMO_DIALOGUE = [
  { speaker: 'The Librarian', text: 'Welcome to the nexus, traveler. I have compiled the sacred texts from the visual novel databases.', mood: 'neutral' },
  { speaker: 'DM Friend', text: 'Heh. Ready to roll the dice? Let\'s see if your stats can handle this quest.', mood: 'happy' },
  { speaker: 'The Librarian', text: 'The world of Zero no Tsukaima awaits. I\'ve cross-referenced VNDB with our lore graph.', mood: 'neutral' },
  { speaker: 'DM Friend', text: 'Roll Initiative! DC 15 Magic Check... Critical hit! The adventure begins!', mood: 'surprised' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Dual-Agent System', desc: 'Librarian + DM Friend co-author your campaign in real-time', color: 'text-violet-400' },
  { icon: Scroll, title: 'D&D Campaign Schema', desc: 'Franchise → QuestBook → QuestLog → ShortQuestScroll', color: 'text-amber-400' },
  { icon: Swords, title: 'Live Skill Checks', desc: 'Roll dice, cast spells, fight bosses with real RPG mechanics', color: 'text-pink-400' },
  { icon: BookOpen, title: 'VNDB Integration', desc: 'Official character traits and lore from the Visual Novel Database', color: 'text-cyan-400' },
];

const VNShowcase: React.FC = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect for dialogue preview
  useEffect(() => {
    const dialogue = DEMO_DIALOGUE[currentLine];
    let i = 0;
    setDisplayedText('');
    
    const timer = setInterval(() => {
      if (i < dialogue.text.length) {
        setDisplayedText(prev => prev + dialogue.text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        // Auto-advance after 2s
        setTimeout(() => {
          setCurrentLine(prev => (prev + 1) % DEMO_DIALOGUE.length);
        }, 2500);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [currentLine]);

  const currentDialogue = DEMO_DIALOGUE[currentLine];

  const moodColors: Record<string, string> = {
    neutral: 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]',
    happy: 'border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]',
    surprised: 'border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]',
  };

  return (
    <section className="py-24 bg-[#0a0a0c] border-b border-gray-800/50 relative overflow-hidden" id="vn-studio">
      {/* Background effect */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-900/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <FadeInSection>
          <SectionHeading
            badge="Storybound Studio"
            badgeColor="violet"
            title="AI-Powered Visual"
            titleHighlight="Novel Maker"
            subtitle="Two AI agents — a Librarian and a DM — co-author custom D&D-style anime adventures. Play them in a premium WebGL interface."
          />
        </FadeInSection>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Interactive VN Preview (3 cols) */}
          <FadeInSection delay="100ms" className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/60 bg-[#050508]">
              {/* Parallax BG mockup */}
              <div className="relative h-[400px] bg-gradient-to-b from-purple-950/40 via-[#0a0a14] to-[#050508] flex items-end justify-center overflow-hidden">
                {/* Ambient orbs */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px] animate-float" />
                <div className="absolute top-20 right-20 w-24 h-24 bg-pink-600/10 rounded-full blur-[50px] animate-float-delayed" />
                
                {/* Character silhouettes */}
                <div className="absolute bottom-0 left-[15%] w-[120px] h-[280px] bg-gradient-to-t from-violet-600/20 to-transparent rounded-t-full opacity-40" />
                <div className="absolute bottom-0 right-[15%] w-[120px] h-[260px] bg-gradient-to-t from-pink-600/20 to-transparent rounded-t-full opacity-40" />

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Episode 1 — The Nexus Tavern</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-green-400">AI Active</span>
                  </div>
                </div>

                {/* Dialogue Box */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* Speaker badge */}
                  <div className="inline-block px-4 py-1.5 bg-[#050508] border border-cyan-500/30 text-cyan-400 font-bold text-sm rounded-t-md mb-0 relative z-10">
                    {currentDialogue.speaker}
                  </div>
                  {/* Dialogue panel */}
                  <div className={`glass-panel rounded-md rounded-tl-none p-6 min-h-[100px] ${moodColors[currentDialogue.mood || 'neutral']} transition-all duration-500`}>
                    <p className="text-lg text-gray-100 leading-relaxed font-sans">
                      {displayedText}
                      <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-1 animate-blink align-text-bottom" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Choice buttons mockup */}
              <div className="p-4 bg-[#050508] border-t border-gray-800/50 flex flex-col gap-2 items-end">
                <div className="px-5 py-2.5 glass-panel rounded-md text-cyan-400 font-bold text-sm cursor-default opacity-60">
                  ▸ Ask about Lore
                </div>
                <div className="px-5 py-2.5 glass-panel rounded-md text-cyan-400 font-bold text-sm cursor-default opacity-60">
                  ▸ Roll Initiative
                </div>
              </div>
            </div>

            {/* CTA under preview */}
            <Link
              href="/vn"
              className="mt-6 w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5 text-sm"
            >
              <Play className="w-5 h-5" />
              Enter Storybound Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInSection>

          {/* Feature Cards (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {FEATURES.map((feat, idx) => (
              <FadeInSection key={idx} delay={`${(idx + 1) * 150}ms`} direction="right">
                <div className="group p-5 bg-[#050508] border border-gray-800/60 rounded-xl hover:border-violet-500/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-900 rounded-lg shrink-0 group-hover:bg-violet-900/20 transition-colors">
                      <feat.icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-sm">{feat.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}

            {/* Schema info card */}
            <FadeInSection delay="800ms" direction="right">
              <div className="p-5 bg-violet-950/20 border border-violet-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">Tech Stack</span>
                </div>
                <div className="space-y-2 text-xs text-gray-400 font-mono">
                  <p><span className="text-gray-300">Render:</span> PixiJS parallax · Live2D .moc3</p>
                  <p><span className="text-gray-300">AI:</span> Vercel AI SDK · Zod SceneBlocks</p>
                  <p><span className="text-gray-300">Data:</span> VNDB API · GraphRAG Lore</p>
                  <p><span className="text-gray-300">Monetize:</span> Stripe QuestBook Unlock</p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VNShowcase;
