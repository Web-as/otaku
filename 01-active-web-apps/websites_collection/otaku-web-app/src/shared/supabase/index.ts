// Main export file - import from here in all sites
export { supabase, isSupabaseConfigured, getSupabase } from './config';

export {
  // User profiles
  upsertUserProfile,
  getUserProfile,
  type UserProfile,
  
  // Blog posts
  createBlogPost,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getUserBlogPosts,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
  
  // Anime library
  saveAnimeLibrary,
  getAnimeLibrary,
  addAnimeToLibrary,
  updateAnimeEntry,
  deleteAnimeFromLibrary,
  type AnimeEntry,
  
  // Blog bookmarks
  addBookmark,
  getUserBookmarks,
  removeBookmark,
  type BlogBookmark,
  
  // User preferences
  saveUserPreferences,
  getUserPreferences,
  type UserPreferences,
} from './database';
