import { upsertUserProfile } from '../supabase/database';
import { isSupabaseConfigured } from '../supabase/config';

export type PreregisterAppKey = 'unified' | 'blog' | 'profiles' | 'dmf_rpg';

export const PREREGISTER_APPS: { key: PreregisterAppKey; name: string; description: string }[] = [
  { key: 'unified', name: 'Otaku Gildija', description: 'Unified tracker: library, stats, scanner' },
  { key: 'blog', name: 'Otaku Blog', description: 'Community posts and tags' },
  { key: 'profiles', name: 'Otaku Profiles', description: 'User profiles and discovery' },
  { key: 'dmf_rpg', name: 'DM Friend', description: 'Text-based RPG adventure' },
];

export async function persistPreregisterState(args: {
  userId: string;
  email: string;
  displayName?: string;
  optedApps: PreregisterAppKey[];
  marketingOptIn: boolean;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const now = new Date().toISOString();

    await upsertUserProfile(args.userId, {
      email: args.email,
      display_name: args.displayName,
      preregistered_at: now,
      preregistered_apps: args.optedApps,
      marketing_opt_in: args.marketingOptIn,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Failed to persist preregister state:', err);
    const message = err instanceof Error ? err.message : 'Failed to save preregister selections.';
    return {
      success: false,
      error: `${message} Your account was created, but preferences may not be saved.`,
    };
  }
}
