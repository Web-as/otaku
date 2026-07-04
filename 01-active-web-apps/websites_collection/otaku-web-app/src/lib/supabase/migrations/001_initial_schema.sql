-- Supabase Schema for Otaku Network
-- Run this in Supabase SQL Editor to create all tables

-- ==================== USER PROFILES ====================

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'lifetime')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id);

-- ==================== BLOG POSTS ====================

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  read_time TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- RLS Policies for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Authors can read their own drafts
CREATE POLICY "Authors can read own posts" ON blog_posts
  FOR SELECT USING (auth.uid()::text = author_id);

-- Authors can create posts
CREATE POLICY "Authors can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON blog_posts
  FOR UPDATE USING (auth.uid()::text = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts" ON blog_posts
  FOR DELETE USING (auth.uid()::text = author_id);

-- ==================== ANIME LIBRARY ====================

CREATE TABLE IF NOT EXISTS anime_library (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold')),
  progress INTEGER NOT NULL DEFAULT 0,
  rating INTEGER CHECK (rating >= 0 AND rating <= 10),
  notes TEXT,
  cover_image TEXT,
  genres TEXT[] DEFAULT '{}',
  studios TEXT[] DEFAULT '{}',
  year INTEGER,
  episodes INTEGER,
  resolution TEXT,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Indexes for anime library
CREATE INDEX IF NOT EXISTS idx_anime_library_user ON anime_library(user_id);
CREATE INDEX IF NOT EXISTS idx_anime_library_status ON anime_library(user_id, status);
CREATE INDEX IF NOT EXISTS idx_anime_library_updated ON anime_library(user_id, updated_at DESC);

-- RLS Policies for anime_library
ALTER TABLE anime_library ENABLE ROW LEVEL SECURITY;

-- Users can read their own library
CREATE POLICY "Users can read own library" ON anime_library
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert to their own library
CREATE POLICY "Users can insert to own library" ON anime_library
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own library
CREATE POLICY "Users can update own library" ON anime_library
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete from their own library
CREATE POLICY "Users can delete from own library" ON anime_library
  FOR DELETE USING (auth.uid()::text = user_id);

-- ==================== BLOG BOOKMARKS ====================

CREATE TABLE IF NOT EXISTS blog_bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_user ON blog_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_post ON blog_bookmarks(post_id);

-- RLS Policies for blog_bookmarks
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON blog_bookmarks
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create own bookmarks" ON blog_bookmarks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON blog_bookmarks
  FOR DELETE USING (auth.uid()::text = user_id);

-- ==================== USER PREFERENCES ====================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'lt')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences" ON user_preferences
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anime_library_updated_at BEFORE UPDATE ON anime_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== COMPLETE ====================
-- Schema created successfully!
-- Next steps:
-- 1. Enable RLS in Supabase dashboard
-- 2. Configure Firebase Auth integration
-- 3. Test with sample data
