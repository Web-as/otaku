import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  // Protocol Alpha Mitigation: Supabase Supavisor Connection Pooling
  // The environment variable MUST use the session pooling port (6543)
  // e.g., postgres://[user]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  
  const poolerUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
  if (!poolerUrl) return null;
  
  if (!db) {
    // We set a small max pool size locally because Supavisor handles the massive fan-out
    // Serverless environments should keep max: 1 to prevent local exhaustion
    const client = postgres(poolerUrl, { max: 1, prepare: false });
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
