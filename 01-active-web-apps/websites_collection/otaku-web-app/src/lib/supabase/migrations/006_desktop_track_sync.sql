-- Desktop launcher smart episode sync + in-app blog queue

ALTER TABLE anime_library
  ADD COLUMN IF NOT EXISTS track_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS completes_queue JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN anime_library.track_metadata IS 'Watched episodes by season, desktop sync state, pending blog prompts';
COMMENT ON COLUMN user_profiles.completes_queue IS 'In-app completes section: tracker/blog actions from desktop without browser';

CREATE INDEX IF NOT EXISTS idx_anime_library_track_meta ON anime_library USING gin (track_metadata);
