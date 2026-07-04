import { Sparkles, Wind } from 'lucide-react';
import { useMotionPreference } from '../hooks/useMotionPreference';

type Props = {
  className?: string;
};

export function MotionToggle({ className = '' }: Props) {
  const { isReduced, toggle } = useMotionPreference();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`anime-focus-ring inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-xs font-semibold border transition-colors ${
        isReduced
          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
          : 'border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10'
      } ${className}`}
      aria-pressed={isReduced}
      title={isReduced ? 'Enable animations' : 'Reduce animations'}
    >
      {isReduced ? <Wind className="w-4 h-4" aria-hidden /> : <Sparkles className="w-4 h-4" aria-hidden />}
      <span>{isReduced ? 'Motion: reduced' : 'Motion: full'}</span>
    </button>
  );
}
