import { Trophy, Star, Crown, Sparkles } from 'lucide-react';
import { CAREER_MILESTONES } from '../membership/milestones';

type Props = {
  seriesCount: number;
  careerPercent: number;
  unlockedIds?: string[];
  showConfetti?: boolean;
  gamificationRank?: string;
};

const MILESTONE_ICONS: Record<string, typeof Star> = {
  tracker_25: Star,
  tracker_50: Trophy,
  super_visitor: Sparkles,
  super_user_eligible: Crown,
};

export function CareerLadder({
  seriesCount,
  careerPercent,
  unlockedIds = [],
  showConfetti,
  gamificationRank,
}: Props) {
  return (
    <div className="hud-panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="anime-display text-lg font-bold text-white">Library career</h2>
        {gamificationRank && (
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--anime-cyan,#92c7c7)]">
            Rank · {gamificationRank}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--anime-text-muted)] mb-4">
        {seriesCount} series logged · {careerPercent}% toward next milestone
      </p>

      <div
        className="h-3 bg-black/40 rounded-full overflow-hidden mb-6 border border-[var(--anime-hud-border)]"
        role="progressbar"
        aria-valuenow={careerPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--anime-neon-violet-deep)] via-[var(--anime-gold)] to-[var(--anime-cyan)] transition-all duration-500"
          style={{ width: `${Math.min(100, careerPercent)}%` }}
        />
      </div>

      {showConfetti && (
        <div className="relative h-12 mb-4 overflow-visible pointer-events-none" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="landing-confetti-piece"
              style={{
                left: `${(i * 12) % 90}%`,
                top: 0,
                background: i % 2 ? 'var(--anime-gold)' : 'var(--anime-neon-violet)',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      <ul className="space-y-3">
        {CAREER_MILESTONES.map((m) => {
          const done = seriesCount >= m.requiredSeries || unlockedIds.includes(m.id);
          const Icon = MILESTONE_ICONS[m.id] ?? Star;
          return (
            <li
              key={m.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                done
                  ? 'border-[var(--anime-gold)]/40 bg-[var(--anime-gold)]/5'
                  : 'border-white/10 bg-black/20'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 mt-0.5 ${done ? 'text-[var(--anime-gold)]' : 'text-zinc-600'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <span className={`font-semibold ${done ? 'text-white' : 'text-zinc-400'}`}>{m.label}</span>
                  <span className="text-xs text-zinc-500 shrink-0">
                    {done ? 'Unlocked' : `${m.requiredSeries} series`}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-zinc-500 mt-4 border-t border-white/10 pt-3">
        Super User is never sold — earn via career milestones (150+ series eligible).
      </p>
    </div>
  );
}
