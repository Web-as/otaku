// Shared Database Functions for All 3 Sites using Supabase
import { getSupabase } from './config';

// ==================== USER PROFILES ====================

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  avatar_description?: string; // Prompt used to generate the avatar
  tier: 'free' | 'premium' | 'lifetime';
  badges?: string[]; // Array of badge types
  active_title?: string; // User's selected title
  preregistered_at?: string;
  preregistered_apps?: string[];
  marketing_opt_in?: boolean;
  created_at: string;
  updated_at: string;
  /** Stripe-backed: tracker/anime library premium */
  /** null = unset (legacy tier); true/false explicit from webhook */
  library_subscription_active?: boolean | null;
  /** null = unset; true/false desktop app entitlement */
  program_access?: boolean | null;
  program_license_key?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_checkout_session_id?: string;
  purchase_date?: string;
  purchase_type?: string;
  /** True when desktop app came from app-only checkout (not subscription bundle) */
  program_standalone?: boolean | null;
  role?: 'guest' | 'user' | 'vip' | 'early_access' | 'op' | 'super_user';
  membership_stage?: 'guest' | 'pass_holder' | 'app_owner' | 'vip' | 'super_user';
  subscription_end_date?: string | null;
  subscription_cancel_at_period_end?: boolean;
  super_user_eligible?: boolean;
  library_career?: { series_logged: number; milestones_unlocked: string[] };
}

// Create or update user profile
export const upsertUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const supabase = getSupabase();
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return profile;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

// ==================== ANIME LIBRARY (LT Site) ====================

export interface AnimeEntry {
  id?: string;
  user_id: string;
  anime_id: string;
  title: string;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';
  progress: number;
  rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Save entire anime library for user
export const saveAnimeLibrary = async (userId: string, animeList: AnimeEntry[]) => {
  const supabase = getSupabase();
  
  // Add user_id and timestamps to all entries
  const entries = animeList.map(anime => ({
    ...anime,
    user_id: userId,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('anime_library')
    .upsert(entries, { onConflict: 'user_id,anime_id' })
    .select();

  if (error) throw error;
  return data;
};

// Get user's anime library
export const getAnimeLibrary = async (userId: string): Promise<AnimeEntry[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('anime_library')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Add single anime to library
export const addAnimeToLibrary = async (anime: AnimeEntry) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('anime_library')
    .insert({
      ...anime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update anime entry
export const updateAnimeEntry = async (userId: string, animeId: string, updates: Partial<AnimeEntry>) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('anime_library')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete anime from library
export const deleteAnimeFromLibrary = async (userId: string, animeId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('anime_library')
    .delete()
    .eq('user_id', userId)
    .eq('anime_id', animeId);

  if (error) throw error;
};

// ==================== BLOG POSTS (Blog Site) ====================

export interface BlogPost {
  id?: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  cover_image?: string;
  read_time?: string;
  published: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Create new blog post
export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      published_at: post.published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all published blog posts
export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
};

// Get user's blog posts (including drafts)
export const getUserBlogPosts = async (userId: string): Promise<BlogPost[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update blog post
export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...updates,
      published_at: updates.published ? new Date().toISOString() : undefined,
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete blog post
export const deleteBlogPost = async (postId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
};

// ==================== BLOG BOOKMARKS (Blog Site) ====================

export interface BlogBookmark {
  id?: string;
  user_id: string;
  post_id: string;
  created_at?: string;
}

// Save blog bookmark
export const addBookmark = async (userId: string, postId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_bookmarks')
    .insert({ user_id: userId, post_id: postId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's bookmarks
export const getUserBookmarks = async (userId: string): Promise<BlogBookmark[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Remove bookmark
export const removeBookmark = async (userId: string, postId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('blog_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) throw error;
};

// ==================== USER PREFERENCES ====================

export interface UserPreferences {
  user_id: string;
  theme?: 'dark' | 'light';
  language?: 'en' | 'lt' | 'jp';
  notifications_enabled?: boolean;
  email_updates?: boolean;
  preferences?: Record<string, any>;
  updated_at?: string;
}

// Save user preferences
export const saveUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: userId, 
      ...preferences, 
      updated_at: new Date().toISOString() 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
};
