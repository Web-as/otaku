/**
 * Blog profile visual tier — same layout, different “skin” by membership.
 * pass_holder = Library Admission Card · vip · super_user (earned only)
 */

export type BlogProfileTier = 'guest' | 'pass_holder' | 'vip' | 'super_user';

export interface BlogProfileTheme {
  tier: BlogProfileTier;
  label: string;
  shortLabel: string;
  description: string;
  /** Applied on root shell via style + data-tier */
  cssVars: Record<string, string>;
  shellClass: string;
  headerClass: string;
  headerGlowClass: string;
  cardClass: string;
  statCardClass: string;
  badgeClass: string;
  accentTextClass: string;
  avatarRingClass: string;
  tabActiveClass: string;
  borderAccentClass: string;
}

const THEMES: Record<BlogProfileTier, BlogProfileTheme> = {
  guest: {
    tier: 'guest',
    label: 'Registered Guest',
    shortLabel: 'Guest',
    description: 'Public blog — get a Library Pass to unlock the member card skin.',
    cssVars: {
      '--blog-bg': '#0f0f1a',
      '--blog-surface': '#1a1a2e',
      '--blog-accent': '#c026d3',
      '--blog-accent-muted': 'rgba(192, 38, 211, 0.15)',
      '--blog-header-from': '#1a1a2e',
      '--blog-header-to': '#0f0f1a',
      '--rarity-border': '#6b7280',
      '--rarity-glow': 'rgba(107, 114, 128, 0.2)',
    },
    shellClass: 'blog-profile blog-profile--guest',
    headerClass:
      'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--blog-header-from)] to-[var(--blog-header-to)] p-6',
    headerGlowClass: '',
    cardClass: 'rounded-xl border border-white/10 bg-[var(--blog-surface)]/80 p-5',
    statCardClass: 'rounded-xl border border-white/10 bg-[var(--blog-surface)] p-4 text-center',
    badgeClass: 'bg-gray-700/80 text-gray-300 border border-gray-600',
    accentTextClass: 'text-primary-400',
    avatarRingClass: 'ring-2 ring-white/20',
    tabActiveClass: 'bg-primary-600 text-white',
    borderAccentClass: 'border-white/10',
  },
  pass_holder: {
    tier: 'pass_holder',
    label: 'Library Pass Member',
    shortLabel: 'Card Holder',
    description: 'Active Library Admission Card — member stacks and inventory key.',
    cssVars: {
      '--blog-bg': '#12100c',
      '--blog-surface': '#1c1810',
      '--blog-accent': '#f59e0b',
      '--blog-accent-muted': 'rgba(245, 158, 11, 0.18)',
      '--blog-header-from': '#2a2210',
      '--blog-header-to': '#12100c',
    },
    shellClass: 'blog-profile blog-profile--pass',
    headerClass:
      'relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-br from-[var(--blog-header-from)] via-[#1a1508] to-[var(--blog-header-to)] p-6 shadow-[0_0_40px_rgba(245,158,11,0.08)]',
    headerGlowClass:
      'pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl',
    cardClass:
      'rounded-xl border border-amber-500/25 bg-[var(--blog-surface)]/90 p-5 shadow-inner shadow-amber-900/10',
    statCardClass:
      'rounded-xl border border-amber-500/20 bg-[var(--blog-surface)] p-4 text-center',
    badgeClass: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
    accentTextClass: 'text-amber-400',
    avatarRingClass: 'ring-2 ring-amber-400/60 ring-offset-2 ring-offset-[#12100c]',
    tabActiveClass: 'bg-amber-600 text-black font-bold',
    borderAccentClass: 'border-amber-500/25',
  },
  vip: {
    tier: 'vip',
    label: 'VIP Librarian',
    shortLabel: 'VIP',
    description: 'VIP flair on your admission card — priority presence on the gazette.',
    cssVars: {
      '--blog-bg': '#100c18',
      '--blog-surface': '#1a1228',
      '--blog-accent': '#e879f9',
      '--blog-accent-muted': 'rgba(232, 121, 249, 0.2)',
      '--blog-header-from': '#2d1b4e',
      '--blog-header-to': '#100c18',
    },
    shellClass: 'blog-profile blog-profile--vip',
    headerClass:
      'relative overflow-hidden rounded-2xl border border-fuchsia-400/40 bg-gradient-to-br from-[var(--blog-header-from)] via-violet-950 to-[var(--blog-header-to)] p-6 shadow-[0_0_48px_rgba(232,121,249,0.12)]',
    headerGlowClass:
      'pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.06)_0%,transparent_40%,rgba(232,121,249,0.1)_100%)]',
    cardClass:
      'rounded-xl border border-fuchsia-500/30 bg-[var(--blog-surface)]/95 p-5',
    statCardClass:
      'rounded-xl border border-fuchsia-500/25 bg-gradient-to-b from-violet-950/80 to-[var(--blog-surface)] p-4 text-center',
    badgeClass: 'bg-gradient-to-r from-amber-500/30 to-fuchsia-500/30 text-amber-100 border border-amber-400/50',
    accentTextClass: 'text-fuchsia-300',
    avatarRingClass: 'ring-2 ring-fuchsia-400/70 ring-offset-2 ring-offset-[#100c18]',
    tabActiveClass: 'bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white font-bold',
    borderAccentClass: 'border-fuchsia-500/30',
  },
  super_user: {
    tier: 'super_user',
    label: 'Super User',
    shortLabel: 'Super',
    description: 'Earned through library career — not sold. Highest gazette presence.',
    cssVars: {
      '--blog-bg': '#080810',
      '--blog-surface': '#12101f',
      '--blog-accent': '#a78bfa',
      '--blog-accent-muted': 'rgba(167, 139, 250, 0.22)',
      '--blog-header-from': '#1e1b4b',
      '--blog-header-to': '#080810',
    },
    shellClass: 'blog-profile blog-profile--super',
    headerClass:
      'relative overflow-hidden rounded-2xl border border-violet-400/50 bg-gradient-to-br from-[var(--blog-header-from)] via-indigo-950 to-[var(--blog-header-to)] p-6 shadow-[0_0_60px_rgba(139,92,246,0.2)]',
    headerGlowClass:
      'pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.25),transparent_55%)] animate-pulse',
    cardClass:
      'rounded-xl border border-violet-400/35 bg-[var(--blog-surface)]/95 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    statCardClass:
      'rounded-xl border border-violet-400/30 bg-[var(--blog-surface)] p-4 text-center',
    badgeClass:
      'bg-violet-500/25 text-violet-100 border border-violet-300/50 shadow-[0_0_12px_rgba(167,139,250,0.35)]',
    accentTextClass: 'text-violet-300',
    avatarRingClass:
      'ring-2 ring-violet-300/80 ring-offset-2 ring-offset-[#080810] shadow-[0_0_20px_rgba(167,139,250,0.45)]',
    tabActiveClass: 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/30',
    borderAccentClass: 'border-violet-400/35',
  },
};

export function resolveBlogProfileTier(input: {
  role?: string | null;
  membership_stage?: string | null;
  library_subscription_active?: boolean | null;
  hasValidPass?: boolean;
}): BlogProfileTier {
  const role = input.role ?? 'guest';
  if (role === 'super_user' || role === 'op') return 'super_user';
  if (role === 'vip' || input.membership_stage === 'vip') return 'vip';
  if (
    input.hasValidPass ||
    input.library_subscription_active === true ||
    input.membership_stage === 'pass_holder' ||
    input.membership_stage === 'app_owner'
  ) {
    return 'pass_holder';
  }
  return 'guest';
}

export function getBlogProfileTheme(tier: BlogProfileTier): BlogProfileTheme {
  return THEMES[tier];
}

export function themeFromProfile(
  profile: {
    role?: string | null;
    membership_stage?: string | null;
    library_subscription_active?: boolean | null;
  } | null,
  hasValidPass?: boolean,
): BlogProfileTheme {
  const tier = resolveBlogProfileTier({
    role: profile?.role,
    membership_stage: profile?.membership_stage,
    library_subscription_active: profile?.library_subscription_active,
    hasValidPass,
  });
  return getBlogProfileTheme(tier);
}
