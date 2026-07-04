-- Add badges/title + preregister columns to user_profiles
--
-- Context:
-- - Shared Firebase bootstrap code writes `badges` and `active_title`.
-- - Preregister site stores preregister state on the user_profiles row.

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS badges TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS active_title TEXT,
ADD COLUMN IF NOT EXISTS preregistered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS preregistered_apps TEXT[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false;

-- Optional index (safe for MVP)
CREATE INDEX IF NOT EXISTS idx_user_profiles_preregistered_at ON user_profiles(preregistered_at);
