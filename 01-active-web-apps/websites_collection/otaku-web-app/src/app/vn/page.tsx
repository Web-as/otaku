import Link from 'next/link'
import { Sparkles, Play, Hammer, BookOpen, ArrowLeft, Scroll, Brain, Swords, Crown } from 'lucide-react'

export default function VnHubPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-amber-950/10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-anime-grid opacity-3 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition text-sm font-mono mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Header */}
        <header className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-bold tracking-[0.35em] uppercase">
            <Sparkles className="w-3 h-3 mr-2" />
            Visual Novel Maker
          </div>
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent leading-tight">
            Storybound Studio
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Anime Librarian + DM Friend co-author campaigns. PixiJS parallax, Live2D-ready sprites, Zod Scene Blocks.
          </p>
        </header>

        {/* Navigation Cards */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <Link href="/vn/play/demo-scroll" className="group rounded-2xl border border-white/8 bg-black/40 backdrop-blur-sm p-7 hover:border-purple-500/40 hover:bg-purple-950/10 transition-all duration-300 transform hover:-translate-y-1">
            <Play className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-lg mb-1">Play Demo Episode</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Episode 1 free · AI Scene Blocks via Vercel AI SDK</p>
          </Link>

          <Link href="/vn/builder" className="group rounded-2xl border border-white/8 bg-black/40 backdrop-blur-sm p-7 hover:border-amber-500/40 hover:bg-amber-950/10 transition-all duration-300 transform hover:-translate-y-1">
            <Hammer className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-lg mb-1">Quest Log Builder</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Define BBEG DCs, story arcs, and campaign structure</p>
          </Link>

          <Link href="/vn/library" className="group rounded-2xl border border-white/8 bg-black/40 backdrop-blur-sm p-7 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-300 transform hover:-translate-y-1">
            <BookOpen className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-lg mb-1">Otaku Librarian</h2>
            <p className="text-sm text-gray-500 leading-relaxed">VNDB + Jikan · GraphRAG lore graph · Character database</p>
          </Link>

          <Link href="/vn/dm-tavern" className="group rounded-2xl border border-white/8 bg-black/40 backdrop-blur-sm p-7 hover:border-emerald-500/40 hover:bg-emerald-950/10 transition-all duration-300 transform hover:-translate-y-1">
            <Crown className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-lg mb-1">DM Tavern</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Full local DM brain + campaign management</p>
          </Link>
        </nav>

        {/* Tech Overview */}
        <section className="rounded-2xl border border-white/8 bg-black/30 backdrop-blur-sm p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-6 flex items-center">
            <Scroll className="w-4 h-4 mr-2 text-violet-400" />
            System Architecture
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div className="space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" /> Data Schema
              </h4>
              <p className="font-mono text-xs leading-relaxed">
                Franchise → QuestCampaign → QuestBook → QuestLog → ShortQuestScroll
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-pink-400" /> AI Agents
              </h4>
              <p className="font-mono text-xs leading-relaxed">
                Librarian (VNDB/GraphRAG) ↔ DM Friend (Zod SceneBlock output)
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Rendering
              </h4>
              <p className="font-mono text-xs leading-relaxed">
                PixiJS parallax · Live2D .moc3 · Stripe QuestBook unlock
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
