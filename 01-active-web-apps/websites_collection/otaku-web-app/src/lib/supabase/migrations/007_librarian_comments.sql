-- Kana (Anime Librarian) comments on public mini-posts / blog entries

CREATE TABLE IF NOT EXISTS librarian_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  post_source TEXT NOT NULL DEFAULT 'mini_post',
  author_id TEXT NOT NULL DEFAULT 'librarian',
  author_display_name TEXT NOT NULL DEFAULT 'Kana',
  prompt_id TEXT,
  body TEXT NOT NULL,
  personalized BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_librarian_comments_post ON librarian_comments(post_id, created_at DESC);

ALTER TABLE librarian_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read librarian_comments" ON librarian_comments FOR SELECT USING (true);
CREATE POLICY "Allow insert librarian_comments" ON librarian_comments FOR INSERT WITH CHECK (true);
