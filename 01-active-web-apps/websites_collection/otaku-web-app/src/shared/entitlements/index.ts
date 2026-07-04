// Unified entitlement system — library subscription vs program-only paths (server webhook is source of truth)

import { getUserProfile, upsertUserProfile } from '../supabase';

export type UserTier = 'free' | 'premium' | 'lifetime';

export type PurchaseTypeTracked = 'library_subscription' | 'program_download';

export interface UserEntitlements {
  tier: UserTier;
  hasLibraryPremium: boolean;
  hasProgramAccess: boolean;
  programLicenseKey?: string;
  purchaseDate?: string;
  purchaseType?: PurchaseTypeTracked | 'legacy';
}

function profileTier(p: { tier?: string }): UserTier {
  const t = p.tier as UserTier;
  return t === 'premium' || t === 'lifetime' || t === 'free' ? t : 'free';
}

/** Derive UX flags — prefers explicit Stripe columns when migration has populated booleans */
export function entitlementsFromProfile(profile: Record<string, unknown> | null): UserEntitlements {
  if (!profile) {
    return { tier: 'free', hasLibraryPremium: false, hasProgramAccess: false };
  }

  const tier = profileTier(profile);
  const legacyPremium = tier === 'premium' || tier === 'lifetime';
  const libCol = profile.library_subscription_active;
  const progCol = profile.program_access;
  /** Webhook-managed rows store real booleans; legacy rows use null omit */
  const migrated =
    libCol === true ||
    libCol === false ||
    progCol === true ||
    progCol === false;

  let hasLibraryPremium: boolean;
  let hasProgramAccess: boolean;
  if (!migrated) {
    hasLibraryPremium = legacyPremium;
    hasProgramAccess = legacyPremium;
  } else {
    hasLibraryPremium = libCol === true;
    /** Program access: standalone purchase or included with library subscription bundle */
    hasProgramAccess = progCol === true || libCol === true;
  }

  const pt = typeof profile.purchase_type === 'string' ? profile.purchase_type : undefined;
  const normalizedPurchase =
    pt === 'library_subscription' || pt === 'program_download'
      ? (pt as PurchaseTypeTracked)
      : legacyPremium && !migrated
        ? 'legacy'
        : undefined;

  return {
    tier,
    hasLibraryPremium,
    hasProgramAccess,
    programLicenseKey:
      typeof profile.program_license_key === 'string'
        ? profile.program_license_key
        : undefined,
    purchaseDate: typeof profile.purchase_date === 'string' ? profile.purchase_date : undefined,
    purchaseType: normalizedPurchase,
  };
}

export const getUserEntitlements = async (userId: string): Promise<UserEntitlements> => {
  const profile = await getUserProfile(userId);
  return entitlementsFromProfile(profile as unknown as Record<string, unknown>);
};

/** @deprecated Prefer webhook + getUserEntitlements */
export const grantEntitlements = async (): Promise<UserEntitlements> => {
  console.warn('grantEntitlements is deprecated; use Stripe webhook + profile updates');
  throw new Error('Client-side entitlement grant is disabled');
};

export const hasPremiumAccess = async (userId: string): Promise<boolean> => {
  const e = await getUserEntitlements(userId);
  return e.hasLibraryPremium;
};

export const hasProgramAccess = async (userId: string): Promise<boolean> => {
  const e = await getUserEntitlements(userId);
  return e.hasProgramAccess;
};

export const getProgramLicenseKey = async (userId: string): Promise<string | null> => {
  const e = await getUserEntitlements(userId);
  return e.programLicenseKey || null;
};

export { upsertUserProfile };
