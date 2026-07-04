-- Gamification event ledger + CQRS projection (Firebase UID as user_id)
CREATE TABLE IF NOT EXISTS "gamification_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "event_type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_gamification_events_user" ON "gamification_events" ("user_id");

CREATE TABLE IF NOT EXISTS "user_stats" (
  "user_id" text PRIMARY KEY NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "total_xp" integer DEFAULT 0 NOT NULL,
  "gold" integer DEFAULT 0 NOT NULL,
  "rank" text DEFAULT 'Novice' NOT NULL,
  "unlocked_artifacts" text[],
  "updated_at" timestamp DEFAULT now() NOT NULL
);
