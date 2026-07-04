-- Simplified Supabase Schema for Firebase Auth
-- This works with Firebase authentication (no auth.users table)

-- ==================== USER PROFILES ====================
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free',
  badges TEXT[] NOT NULL DEFAULT '{}'::text[],
  active_title TEXT,
  preregistered_at TIMESTAMPTZ,
  preregistered_apps TEXT[] NOT NULL DEFAULT '{}'::text[],
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  program_license_key TEXT UNIQUE,
  purchase_date TIMESTAMPTZ,
  purchase_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since we're using Firebase Auth, not Supabase Auth)
CREATE POLICY "Allow all for user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== ANIME LIBRARY ====================
CREATE TABLE IF NOT EXISTS anime_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  anime_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'plan_to_watch',
  progress INTEGER DEFAULT 0,
  rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Enable Row Level Security
ALTER TABLE anime_library ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for anime_library" ON anime_library
  FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_anime_library_user_id ON anime_library(user_id);
CREATE INDEX IF NOT EXISTS idx_anime_library_status ON anime_library(user_id, status);

-- ==================== BLOG BOOKMARKS ====================
CREATE TABLE IF NOT EXISTS blog_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_slug)
);

-- Enable Row Level Security
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for blog_bookmarks" ON blog_bookmarks
  FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_user_id ON blog_bookmarks(user_id);

-- ==================== USER PREFERENCES ====================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for user_preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anime_library_updated_at BEFORE UPDATE ON anime_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
