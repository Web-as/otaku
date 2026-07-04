import type { LibrarianAnimeContext, LibrarianPrompt } from './types';

type TitleTone = 'isekai' | 'romance' | 'action' | 'slice' | 'horror' | 'sports' | 'generic';

function toneFromTitle(title: string): TitleTone {
  const t = title.toLowerCase();
  if (/isekai|another world|reincarnat|summon/.test(t)) return 'isekai';
  if (/love|kiss|romance|girlfriend|boyfriend|dating/.test(t)) return 'romance';
  if (/horror|ghost|curse|death note|parasyte/.test(t)) return 'horror';
  if (/ball|sport|haikyu|slam dunk|run|race/.test(t)) return 'sports';
  if (/daily|life|club|school|non-non|yuru/.test(t)) return 'slice';
  if (/fight|hero|ninja|demon|hunter|sword|battle/.test(t)) return 'action';
  return 'generic';
}

function epLabel(ctx: LibrarianAnimeContext): string {
  const s = ctx.season ?? 1;
  const e = ctx.episode ?? ctx.episodesWatched;
  if (e != null && e > 0) return `S${s}E${e}`;
  if (ctx.episodesWatched != null && ctx.episodesWatched > 0) {
    return `episode ${ctx.episodesWatched}`;
  }
  return 'this point in the show';
}

export function generateLibrarianPrompts(ctx: LibrarianAnimeContext): LibrarianPrompt[] {
  const title = ctx.title.trim() || 'this series';
  const tone = toneFromTitle(title);
  const ep = epLabel(ctx);
  const prog =
    ctx.episodesWatched != null && ctx.totalEpisodes
      ? `${ctx.episodesWatched}/${ctx.totalEpisodes}`
      : null;
  const status = ctx.status ?? 'Watching';

  const base: LibrarianPrompt[] = [
    {
      id: 'hook',
      text: `What hooked you on "${title}" — the ${ep} moment, or something earlier?`,
      category: 'hook',
      answerHints: ['hook', 'first', 'episode', 'pilot', 'opening', 'intro', 'scene', 'moment'],
    },
    {
      id: 'standout',
      text: `Which character in "${title}" surprised you most so far, and why?`,
      category: 'characters',
      answerHints: ['character', 'protagonist', 'villain', 'side', 'development', 'arc', 'favorite'],
    },
    {
      id: 'themes',
      text: `What theme is "${title}" exploring at ${ep} that you want readers to notice?`,
      category: 'themes',
      answerHints: ['theme', 'message', 'metaphor', 'symbol', 'meaning', 'about', 'explores'],
    },
  ];

  const toneSpecific: LibrarianPrompt[] = (() => {
    switch (tone) {
      case 'isekai':
        return [
          {
            id: 'world-rules',
            text: `How do the world rules in "${title}" compare to other isekai you've seen?`,
            category: 'comparison',
            answerHints: ['isekai', 'world', 'system', 'skill', 'compared', 'similar'],
          },
        ];
      case 'romance':
        return [
          {
            id: 'chemistry',
            text: `Does the chemistry in "${title}" feel earned at ${ep}, or still warming up?`,
            category: 'pacing',
            answerHints: ['chemistry', 'romance', 'relationship', 'couple', 'slow', 'burn'],
          },
        ];
      case 'action':
        return [
          {
            id: 'stakes',
            text: `Are the stakes in "${title}" rising cleanly, or did a fight feel like filler?`,
            category: 'pacing',
            answerHints: ['fight', 'battle', 'stakes', 'animation', 'sakuga', 'filler', 'arc'],
          },
        ];
      case 'horror':
        return [
          {
            id: 'dread',
            text: `What keeps the dread going in "${title}" without spoiling later twists?`,
            category: 'themes',
            answerHints: ['scary', 'tension', 'atmosphere', 'dread', 'horror', 'creepy'],
          },
        ];
      case 'sports':
        return [
          {
            id: 'team',
            text: `Which matchup or team dynamic in "${title}" are you rooting for next?`,
            category: 'characters',
            answerHints: ['team', 'match', 'tournament', 'coach', 'win', 'loss'],
          },
        ];
      case 'slice':
        return [
          {
            id: 'comfort',
            text: `What cozy or chaotic detail in "${title}" makes ${ep} worth blogging about?`,
            category: 'hook',
            answerHints: ['cozy', 'comedy', 'wholesome', 'relaxing', 'vibes', 'funny'],
          },
        ];
      default:
        return [
          {
            id: 'pacing',
            text: `Is "${title}" pacing well at ${ep}, or would you tell a friend to binge later?`,
            category: 'pacing',
            answerHints: ['pacing', 'slow', 'fast', 'binge', 'weekly', 'drop', 'continue'],
          },
        ];
    }
  })();

  const statusSpecific: LibrarianPrompt[] = [];
  if (status === 'Completed' || ctx.postType === 'quick_review') {
    statusSpecific.push({
      id: 'verdict',
      text: `If you had one sentence for someone on the fence about "${title}", what is it?`,
      category: 'recommend',
      answerHints: ['recommend', 'watch', 'skip', 'worth', 'verdict', 'overall', '10', 'rating'],
    });
  } else if (status === 'Plan to Watch' || ctx.postType === 'recommendation') {
    statusSpecific.push({
      id: 'why-start',
      text: `Why put "${title}" on your list now instead of another show in the same season?`,
      category: 'recommend',
      answerHints: ['recommend', 'season', 'hype', 'trailer', 'friend', 'list', 'queue'],
    });
  } else if (prog) {
    statusSpecific.push({
      id: 'progress',
      text: `At ${prog} episodes of "${title}", what would you tell past-you before starting?`,
      category: 'pacing',
      answerHints: ['episode', 'progress', 'caught up', 'behind', 'weekly', String(ctx.episodesWatched)],
    });
  }

  if (ctx.rating != null && ctx.rating > 0) {
    statusSpecific.push({
      id: 'score',
      text: `Your ${ctx.rating}/10 for "${title}" — what single thing earned or lost that point?`,
      category: 'themes',
      answerHints: ['rating', 'score', String(ctx.rating), '10', 'point', 'deduct'],
    });
  }

  const merged = [...base, ...toneSpecific, ...statusSpecific];
  const seen = new Set<string>();
  return merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).slice(0, 6);
}
