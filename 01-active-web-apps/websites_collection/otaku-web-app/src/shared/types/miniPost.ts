// Mini-post types for quick anime updates from Tracker to Blog

export type MiniPostType = 'status_update' | 'quick_review' | 'rating' | 'recommendation';

export type MiniPostVisibility = 'public' | 'private_draft';

export interface MiniPost {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  
  // Post type and content
  type: MiniPostType;
  content: string; // Short text (max 500 chars)
  
  // Anime reference
  anime_id: string;
  anime_title: string;
  anime_cover?: string;
  
  // Rating (if type is 'rating' or 'quick_review')
  rating?: number; // 0-10
  
  // Status (if type is 'status_update')
  status?: 'started' | 'watching' | 'completed' | 'dropped' | 'plan_to_watch';
  episodes_watched?: number;
  total_episodes?: number;
  
  // Metadata
  created_at: string;
  likes?: number;

  /** Public feed vs private draft (only owner sees drafts on blog "My drafts") */
  visibility?: MiniPostVisibility;

  /** Tracker quick-post vs manual compose */
  source?: 'tracker' | 'manual';

  /** True when created by automatic watch-progress hooks */
  auto_generated?: boolean;

  // Optional tags
  tags?: string[];
  spoiler?: boolean;
}

export interface CreateMiniPostInput {
  type: MiniPostType;
  content: string;
  anime_id: string;
  anime_title: string;
  anime_cover?: string;

  visibility?: MiniPostVisibility;
  source?: 'tracker' | 'manual';
  auto_generated?: boolean;

  rating?: number;
  status?: 'started' | 'watching' | 'completed' | 'dropped' | 'plan_to_watch';
  episodes_watched?: number;
  total_episodes?: number;
  tags?: string[];
  spoiler?: boolean;
}
