import type { LibrarianAnimeContext, LibrarianPrompt } from './types';
import { LIBRARIAN_PERSONA } from './types';
import { generateLibrarianPrompts } from './prompts';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ');
}

export function detectAnsweredPrompts(
  content: string,
  prompts: LibrarianPrompt[],
): LibrarianPrompt[] {
  const body = normalize(content);
  if (body.trim().length < 24) return [];

  const scored = prompts
    .map((p) => ({
      p,
      hits: p.answerHints.filter((h) => body.includes(h.toLowerCase())).length,
    }))
    .filter((x) => x.hits > 0 || (body.length >= 72 && x.p.id === 'hook'));

  return scored
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 2)
    .map((x) => x.p);
}

export function craftLibrarianReply(
  prompt: LibrarianPrompt,
  ctx: LibrarianAnimeContext,
  userContent: string,
): string {
  const title = ctx.title;
  const snippet = userContent.trim().slice(0, 120);
  const opener = snippet.length > 40 ? 'Oh? You answered my question' : 'I was wondering about this';

  const tails: Record<string, string> = {
    hook: ` — your take on what pulled you into "${title}" is exactly the kind of note I file at the desk.`,
    characters: ` — good eye on the cast of "${title}". I'll cross-link that with the lore index.`,
    themes: ` — that theme read on "${title}" helps the next reader who hasn't caught up yet.`,
    pacing: ` — useful pacing note for "${title}". I'll keep it next to the tracker entry.`,
    comparison: ` — comparisons like that are why the archives exist. Thanks for logging it.`,
    recommend: ` — that's a solid shelf recommendation for "${title}".`,
  };

  return `${LIBRARIAN_PERSONA.emoji} **${LIBRARIAN_PERSONA.name}** (${LIBRARIAN_PERSONA.title}): ${opener} about *${prompt.text.slice(0, 60)}…*${tails[prompt.category] ?? ` — noted for "${title}".`}`;
}

export function buildPromptsForPost(
  animeTitle: string,
  animeId: string,
  extras?: Partial<LibrarianAnimeContext>,
): LibrarianPrompt[] {
  return generateLibrarianPrompts({
    animeId,
    title: animeTitle,
    ...extras,
  });
}
