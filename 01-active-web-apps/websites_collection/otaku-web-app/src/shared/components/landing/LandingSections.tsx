import type { ReactNode } from 'react';
import { MotionToggle } from '../MotionToggle';
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Library,
  Shield,
  Star,
  Users,
  Zap,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  LANDING_BRAND,
  ecosystemBlocks,
  integrationItems,
  roadmapShipped,
  roadmapNext,
} from './landingCopy';

export type HubUrls = {
  blogUrl: string;
  trackerUrl: string;
  programUrl: string;
  /** Base URL for preregister SPA (terms, login) */
  preregisterUrl?: string;
};

type LandingNavProps = {
  hubUrls: HubUrls;
  onLogin: () => void;
};

export function LandingNav({ hubUrls, onLogin }: LandingNavProps) {
  const strip = (u: string) => u.replace(/\/$/, '');
  const pre = hubUrls.preregisterUrl ? strip(hubUrls.preregisterUrl) : '';
  return (
    <header
      className="anime-scrim border-b border-white/10 sticky top-0 z-40"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center hud-panel-cut">
            <Library className="w-6 h-6 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-semibold anime-display text-lg sm:text-xl text-white truncate">{LANDING_BRAND.title}</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-mono uppercase tracking-widest truncate">
              {LANDING_BRAND.tagline} · {LANDING_BRAND.taglineJp}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Suite sites">
          <a
            href={hubUrls.blogUrl}
            className="anime-focus-ring px-3 py-2.5 min-h-[44px] flex items-center rounded-lg text-sm font-semibold text-indigo-100 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
          >
            Blog
          </a>
          <a
            href={hubUrls.trackerUrl}
            className="anime-focus-ring px-3 py-2.5 min-h-[44px] flex items-center rounded-lg text-sm font-semibold text-amber-100 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            Tracker
          </a>
          <a
            href={hubUrls.programUrl}
            className="anime-focus-ring px-3 py-2.5 min-h-[44px] flex items-center rounded-lg text-sm font-semibold text-stone-200 bg-stone-500/10 border border-stone-500/25 hover:bg-stone-500/20 transition-colors"
          >
            Program
          </a>
          {pre ? (
            <a
              href={`${pre}/login`}
              className="hidden sm:inline-flex anime-focus-ring px-3 py-2.5 min-h-[44px] items-center rounded-lg text-sm text-zinc-300 border border-white/15 hover:bg-white/5"
            >
              Account
            </a>
          ) : null}
          <button
            type="button"
            onClick={onLogin}
            className="anime-focus-ring px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-lg font-semibold bg-amber-400 text-slate-950 border border-amber-300 hover:bg-amber-300 transition-colors"
          >
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}

type MissionCardProps = {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  accent: 'violet' | 'pink' | 'gold';
  badge?: string;
};

function MissionCard({ href, onClick, icon, title, description, cta, accent, badge }: MissionCardProps) {
  const border =
    accent === 'violet'
      ? 'hover:border-violet-400/50 focus-visible:border-violet-400/60'
      : accent === 'pink'
        ? 'hover:border-pink-400/50 focus-visible:border-pink-400/60'
        : 'border-amber-500/40 hover:border-amber-400/60 focus-visible:border-amber-400/70';
  const ring = accent === 'gold' ? 'ring-1 ring-amber-500/30' : '';
  const className = `group hud-panel p-6 sm:p-8 text-left transition-all ${border} ${ring} anime-focus-ring block w-full min-h-[44px] cursor-pointer`;

  const inner = (
    <>
      {badge ? (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide bg-amber-400 text-black rounded-full">
          {badge}
        </span>
      ) : null}
      <div className="flex flex-col h-full">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
            accent === 'violet'
              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
              : accent === 'pink'
                ? 'bg-gradient-to-br from-pink-500 to-violet-600'
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
          }`}
        >
          {icon}
        </div>
        <h3 className="anime-display text-xl sm:text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm sm:text-base mb-4 flex-1">{description}</p>
        <span
          className={`inline-flex items-center gap-2 font-bold ${
            accent === 'violet' ? 'text-violet-300' : accent === 'pink' ? 'text-pink-300' : 'text-amber-300'
          }`}
        >
          {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${className} relative`}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${className} relative`}>
      {inner}
    </button>
  );
}

type LandingHeroProps = {
  hubUrls: HubUrls;
  onPurchase: () => void;
  onProgramPillarClick?: () => void;
};

export function LandingHero({ hubUrls, onPurchase, onProgramPillarClick }: LandingHeroProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4" style={{ minHeight: 'min(85dvh, 920px)' }} aria-labelledby="hub-hero-title">
      <div className="max-w-6xl mx-auto text-center landing-tv-scale">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-amber-500/35 bg-amber-500/10 mb-6">
          <Star className="w-4 h-4 text-amber-200 shrink-0" aria-hidden />
          <span className="text-xs sm:text-sm font-semibold text-amber-100">Early access · Pre-registered badge</span>
        </div>

        <h1 id="hub-hero-title" className="anime-display anime-hero-title font-black mb-4 sm:mb-6 anime-text-gradient px-1">
          Your complete anime experience
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 mb-6 max-w-3xl mx-auto leading-relaxed">
          Track your collection. Share your thoughts. Organize your library.{' '}
          <span className="text-cyan-300 font-semibold">All in one guild.</span>
        </p>

        <p className="mb-10">
          <a
            href="#guild-preregister-quest"
            className="anime-focus-ring inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full text-sm font-bold text-amber-100 bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/25 transition-colors"
          >
            Start the guild preregister quest
            <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 text-left">
          <MissionCard
            href={hubUrls.blogUrl}
            icon={<BookOpen className="w-7 h-7 text-white" aria-hidden />}
            title="Social hub"
            description="Read reviews, share updates, and connect with the community."
            cta="Explore blog"
            accent="violet"
          />
          <MissionCard
            href={hubUrls.trackerUrl}
            icon={<Library className="w-7 h-7 text-white" aria-hidden />}
            title="Anime tracker"
            description="Track anime, manage your watchlist, and sync when Supabase is on."
            cta="Open tracker"
            accent="pink"
          />
          <MissionCard
            href={onProgramPillarClick ? undefined : hubUrls.programUrl}
            onClick={onProgramPillarClick ? onPurchase : undefined}
            icon={<Download className="w-7 h-7 text-black" aria-hidden />}
            title="Library program"
            description="Desktop app to organize and launch your collection. €1 early access."
            cta={onProgramPillarClick ? 'Get early access' : 'Open program site'}
            accent="gold"
            badge="€1"
          />
        </div>
        <p className="text-xs text-zinc-500 max-w-2xl mx-auto">
          Hub links use your configured origins. Program tile may start checkout on the sales app.
        </p>
      </div>
    </section>
  );
}

type LandingEcosystemProps = { hubUrls: HubUrls; onProgramCta?: () => void };

export function LandingEcosystem({ hubUrls, onProgramCta }: LandingEcosystemProps) {
  const urlMap = { blog: hubUrls.blogUrl, tracker: hubUrls.trackerUrl, program: hubUrls.programUrl };
  return (
    <section className="py-14 px-4 border-t border-white/10" aria-labelledby="ecosystem-heading">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
          <Sparkles className="w-5 h-5 text-cyan-400" aria-hidden />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300/80">Network / ネットワーク</span>
        </div>
        <h2 id="ecosystem-heading" className="anime-display anime-section-title font-bold text-white text-center sm:text-left mb-10">
          Three sites, one universe
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ecosystemBlocks.map((block) => {
            const href = urlMap[block.key];
            const isProgram = block.key === 'program';
            return (
              <div key={block.key} className="hud-panel p-6 flex flex-col border-t-4 border-t-transparent hover:border-t-cyan-400/50 transition-colors">
                <h3 className="anime-display text-xl font-bold text-white mb-3">{block.title}</h3>
                <ul className="text-sm text-zinc-400 space-y-2 mb-6 flex-1">
                  {block.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {isProgram && onProgramCta ? (
                  <button
                    type="button"
                    onClick={onProgramCta}
                    className="anime-focus-ring inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-lg font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
                  >
                    {block.cta} <ArrowRight className="w-4 h-4" aria-hidden />
                  </button>
                ) : (
                  <a
                    href={href}
                    className="anime-focus-ring inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-lg font-bold bg-slate-800/60 border border-amber-900/30 hover:bg-slate-800"
                  >
                    {block.cta} <ArrowRight className="w-4 h-4" aria-hidden />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingIntegrations() {
  return (
    <section className="py-14 px-4 bg-black/20 border-y border-white/10" aria-labelledby="integrations-heading">
      <div className="max-w-6xl mx-auto">
        <h2 id="integrations-heading" className="anime-display anime-section-title font-bold text-white mb-2">
          System specs
        </h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-2xl">Honest snapshot aligned with suite status docs — not a marketing-only list.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrationItems.map((item) => (
            <div key={item.name} className="hud-panel p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400 shrink-0" aria-hidden />
                  {item.name}
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    item.status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.summary}</p>
              {item.caveat ? <p className="text-xs text-amber-200/90 border-l-2 border-amber-400/50 pl-2">{item.caveat}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingRoadmap() {
  return (
    <section className="py-14 px-4" aria-labelledby="roadmap-heading">
      <div className="max-w-6xl mx-auto">
        <h2 id="roadmap-heading" className="anime-display anime-section-title font-bold text-white mb-2 text-center">
          Quest log · roadmap
        </h2>
        <p className="text-center text-zinc-400 text-sm mb-10 max-w-xl mx-auto">Shipped vs next — distilled from STATUS_WEB_SUITE docs.</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-10">
          <div className="hud-panel p-6 border-l-4 border-emerald-500">
            <h3 className="anime-display text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" aria-hidden /> Cleared quests (shipped)
            </h3>
            <ul className="space-y-3 text-sm text-zinc-300">
              {roadmapShipped.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-emerald-400 shrink-0">▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hud-panel p-6 border-l-4 border-violet-500">
            <h3 className="anime-display text-lg font-bold text-violet-300 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" aria-hidden /> Upcoming quests
            </h3>
            <ul className="space-y-3 text-sm text-zinc-300">
              {roadmapNext.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-violet-400 shrink-0">▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

type LandingEarlyAccessProps = { onPurchase: () => void };

export function LandingEarlyAccess({ onPurchase }: LandingEarlyAccessProps) {
  return (
    <section className="py-14 px-4 border-y border-amber-500/20 bg-gradient-to-r from-amber-500/[0.07] via-orange-500/[0.05] to-transparent" aria-labelledby="early-access-heading">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 mb-4">
          <Zap className="w-4 h-4 text-amber-300" aria-hidden />
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Limited early access</span>
        </div>
        <h2 id="early-access-heading" className="anime-display text-3xl sm:text-4xl font-black text-white mb-4">
          Support the guild — €1
        </h2>
        <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
          Funds hosting and features. Lifetime tracker perks where offered — check success messages for your product key flow.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          <div className="hud-panel p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" aria-hidden /> What you get
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Desktop program roadmap access</li>
              <li>Updates as published</li>
              <li>Tracker premium positioning per offer</li>
              <li>Pre-registered styling where enabled</li>
            </ul>
          </div>
          <div className="hud-panel p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" aria-hidden /> Why €1
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" aria-hidden /> Sustainable development
              </li>
              <li className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" aria-hidden /> Server costs
              </li>
              <li className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" aria-hidden /> Faster iteration
              </li>
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={onPurchase}
          className="anime-focus-ring px-10 py-4 min-h-[48px] rounded-xl font-black text-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg landing-anime-glow-pulse"
        >
          Get early access — €1
        </button>
      </div>
    </section>
  );
}

type LandingWhereNextProps = { hubUrls: HubUrls };

export function LandingWhereNext({ hubUrls }: LandingWhereNextProps) {
  return (
    <section className="py-10 px-4" aria-labelledby="where-next-heading">
      <div className="max-w-6xl mx-auto hud-panel p-6 sm:p-8">
        <h2 id="where-next-heading" className="anime-display text-xl font-bold text-white mb-4 text-center">
          Where to next?
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
          <a
            href={hubUrls.blogUrl}
            className="anime-focus-ring flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-indigo-600/25 border border-indigo-400/40 font-semibold text-indigo-100 py-3"
          >
            Blog <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
          <a
            href={hubUrls.trackerUrl}
            className="anime-focus-ring flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-amber-600/25 border border-amber-400/40 font-semibold text-amber-100 py-3"
          >
            Tracker <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
          <a
            href={hubUrls.programUrl}
            className="anime-focus-ring flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-amber-600/25 border border-amber-400/40 font-semibold text-amber-100 py-3"
          >
            Program <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

type LandingFooterProps = { hubUrls: HubUrls };

export function LandingFooter({ hubUrls }: LandingFooterProps) {
  const y = new Date().getFullYear();
  const pre = hubUrls.preregisterUrl?.replace(/\/$/, '');
  return (
    <footer className="py-10 px-4 border-t border-white/10 anime-scrim" role="contentinfo">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-sm">
          <a href={hubUrls.blogUrl} className="anime-focus-ring text-zinc-400 hover:text-white">
            Blog
          </a>
          <a href={hubUrls.trackerUrl} className="anime-focus-ring text-zinc-400 hover:text-white">
            Tracker
          </a>
          <a href={hubUrls.programUrl} className="anime-focus-ring text-zinc-400 hover:text-white">
            Program
          </a>
          {pre ? (
            <>
              <a href={`${pre}/terms`} className="anime-focus-ring text-zinc-500 hover:text-zinc-300">
                Terms
              </a>
              <a href={`${pre}/privacy`} className="anime-focus-ring text-zinc-500 hover:text-zinc-300">
                Privacy
              </a>
            </>
          ) : null}
        </div>
        <div className="flex flex-col items-center md:items-end gap-3">
          <MotionToggle />
          <p className="text-center md:text-right text-xs text-zinc-500">
            © {y} Library of Otaku · Neo-Tokyo guild hub
          </p>
        </div>
      </div>
      <div className="pointer-events-none h-16 mt-8 opacity-30 bg-gradient-to-t from-purple-950/50 to-transparent" aria-hidden />
    </footer>
  );
}
