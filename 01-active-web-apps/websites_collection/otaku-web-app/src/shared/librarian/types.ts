import type { MiniPostType } from '../types/miniPost';

export type LibrarianAnimeContext = {
  animeId: string;
  title: string;
  status?: string;
  episodesWatched?: number;
  totalEpisodes?: number;
  rating?: number;
  postType?: MiniPostType;
  season?: number;
  episode?: number;
};

export type LibrarianPromptCategory =
  | 'hook'
  | 'characters'
  | 'themes'
  | 'pacing'
  | 'comparison'
  | 'recommend';

export type LibrarianPrompt = {
  id: string;
  text: string;
  category: LibrarianPromptCategory;
  /** Hint words Kana looks for when scouting public posts (she need not have watched it). */
  answerHints: string[];
};

export type LibrarianComment = {
  id: string;
  post_id: string;
  prompt_id?: string;
  author_id: 'librarian';
  author_name: string;
  body: string;
  created_at: string;
  personalized: boolean;
};

export const LIBRARIAN_PERSONA = {
  id: 'librarian',
  name: 'Kana',
  title: 'Anime Librarian',
  emoji: '📖',
} as const;
