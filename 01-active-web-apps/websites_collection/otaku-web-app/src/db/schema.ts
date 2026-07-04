import { pgTable, text, integer, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

// ----------------------------------------------------------------------
// EVENT SOURCING: The Gamification Ledger
// Every action (XP gain, Gacha pull, Level up) is an immutable event
// ----------------------------------------------------------------------
export const gamificationEvents = pgTable(
  "gamification_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    
    // e.g., 'XP_GAINED', 'GACHA_PULLED', 'LEVEL_UP', 'ACHIEVEMENT_UNLOCKED'
    eventType: text("event_type").notNull(),
    
    // JSON payload of the event data (e.g., { "xpAmount": 50, "reason": "watched_episode" })
    payload: jsonb("payload").notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_gamification_events_user").on(table.userId),
  ]
);

// ----------------------------------------------------------------------
// CQRS PROJECTION: The materialized view for fast UI rendering
// ----------------------------------------------------------------------
export const userStats = pgTable(
  "user_stats",
  {
    userId: text("user_id").primaryKey(),
    
    level: integer("level").notNull().default(1),
    totalXp: integer("total_xp").notNull().default(0),
    gold: integer("gold").notNull().default(0),
    rank: text("rank").notNull().default("Novice"), // Novice, Otaku, Kami, etc.
    
    // Array of unlocked 3D artifact IDs
    unlockedArtifacts: text("unlocked_artifacts").array(),
    
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);
