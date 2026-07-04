/**
 * Desktop vs web database mode (MASTER_ARCHITECTURE_2026 §1, snippet_drizzle_schema_dual).
 * Use in otaku-web-app getDb() and Tauri static export builds.
 */

export type DbTarget = 'web' | 'desktop';

export function resolveDbTarget(): DbTarget {
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_TARGET === 'desktop') return 'desktop';
    if (process.env.TAURI_PLATFORM) return 'desktop';
  }
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return 'desktop';
  }
  return 'web';
}

export function isDesktopBuild(): boolean {
  return resolveDbTarget() === 'desktop';
}

/** Env keys expected per target (document in .env.example). */
export const DB_ENV_BY_TARGET: Record<DbTarget, string[]> = {
  web: ['DATABASE_URL'],
  desktop: ['DATABASE_URL', 'SQLITE_PATH'],
};
