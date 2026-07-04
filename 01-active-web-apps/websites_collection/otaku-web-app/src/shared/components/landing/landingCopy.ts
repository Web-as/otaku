/** Doc-aligned copy for hub landing — STATUS_WEB_SUITE + integration honesty */

export const LANDING_BRAND = {
  title: 'Library of Otaku',
  tagline: 'Elegant Fantasy Archive',
  taglineJp: '物語の記録',
};

export const ecosystemBlocks = [
  {
    key: 'blog' as const,
    title: 'Archive Chronicle',
    accent: 'violet',
    bullets: ['Community stories, tags, and reviews', 'Unified auth with the rest of the suite', 'Cross-site flows where enabled'],
    cta: 'Open Otaku Blog',
  },
  {
    key: 'tracker' as const,
    title: 'Moonlit Tracker',
    accent: 'pink',
    bullets: ['Library and progress tracking', 'Jikan-powered discovery (MAL data)', 'Supabase-backed when enabled'],
    cta: 'Open Anime Tracker',
  },
  {
    key: 'program' as const,
    title: 'Archivist Program',
    accent: 'gold',
    bullets: ['Desktop tooling for your collection', '€1 early access offer', 'Stripe checkout from the hub'],
    cta: 'Get early access',
  },
];

export const integrationItems = [
  {
    name: 'Firebase',
    summary: 'Authentication and session; profile bootstrap hooks into Supabase when configured.',
    status: 'live',
    caveat: '',
  },
  {
    name: 'Supabase',
    summary:
      'User profiles schema, RLS policies, anime library and blog helpers; apps can run in mock mode via VITE_USE_SUPABASE.',
    status: 'live',
    caveat: '',
  },
  {
    name: 'Stripe',
    summary: 'Checkout session API + webhook writes library vs program flags to Supabase when configured.',
    status: 'live',
    caveat:
      'Requires STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, and recurring price ID for library subscriptions; client success pages poll profiles but do not grant entitlements.',
  },
  {
    name: 'Jikan (MAL)',
    summary: 'Tracker site search and seasonal data.',
    status: 'live',
    caveat: '',
  },
  {
    name: 'AniList',
    summary: 'Program site integration code paths.',
    status: 'live',
    caveat: 'Consider rate limits / caching for production-scale traffic.',
  },
  {
    name: 'Unified backend (FastAPI)',
    summary: 'Reference billing webhook flow in otaku-gildija-unified backend.',
    status: 'reference',
    caveat: 'Can be modeled for server-side Stripe verification across sites.',
  },
];

export const roadmapShipped = [
  'Split commerce: library subscription vs app-only checkout metadata; Node `/api/webhook` updates user_profiles (library_subscription_active, program_standalone, etc.).',
  'Shared entitlements reader + tracker UI polls Supabase profile for hasLibraryPremium.',
  'Product landing roadmap tabs + dual SKU copy (EN/LT/JP); sales `/login` + redirect utility.',
  'Mini-post local store with public vs private_draft; tracker QuickPost + blog “My drafts”.',
  'UnifiedGateway: demo purchases no longer bump tracker tier cache by default (setLibraryTierCache: false).',
];

export const roadmapNext = [
  'Production Stripe price IDs + webhook signing secrets on every deploy target.',
  'Migrate mini-posts from localStorage to Supabase with owner-scoped RLS.',
  'invoice.paid / subscription.updated handlers for renewal edge cases.',
  'RLS audit pass on user_profiles and blog tables; Jikan/AniList client backoff.',
  'DM Friend narrative content for onboarding page (flag already exists).',
];
