-- Suite tables: mini-posts, quests, inventory (Firebase Auth + permissive RLS)
-- Run after schema-simple.sql or on existing project

CREATE TABLE IF NOT EXISTS mini_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id TEXT NOT NULL,
  author_display_name TEXT,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private_draft')),
  anime_id TEXT,
  anime_title TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mini_posts_author ON mini_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_mini_posts_visibility ON mini_posts(visibility, created_at DESC);

ALTER TABLE mini_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for mini_posts" ON mini_posts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_quests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  quest_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_key)
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user ON user_quests(user_id);

ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for user_quests" ON user_quests FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  item_name TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_key)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for user_inventory" ON user_inventory FOR ALL USING (true) WITH CHECK (true);
