/** Client-side flags for Library Pass upsell prompts */

export const PASS_PROMPT_KEYS = {
  /** Set on first Firebase sign-up; consumed to show welcome modal */
  JUST_REGISTERED: 'otaku_just_registered',
  /** User closed the first-registration modal */
  MODAL_DISMISSED: 'otaku_pass_modal_dismissed',
  /** User dismissed the sticky app banner */
  BANNER_DISMISSED: 'otaku_pass_banner_dismissed',
} as const;

export type PassPromptContext =
  | 'inventory'
  | 'library'
  | 'scanner'
  | 'quests'
  | 'collectibles'
  | 'community'
  | 'membership'
  | 'settings'
  | 'general';

const COPY: Record<
  PassPromptContext,
  { title: string; body: string; cta: string }
> = {
  inventory: {
    title: 'Unlock your inventory',
    body: 'Items like your Library Admission Card live in inventory. Subscribe to the Library Pass (~€2.50/mo) to mint your card and use renew, cancel, and VIP upgrades.',
    cta: 'Get Library Card',
  },
  library: {
    title: 'Enter the member stacks',
    body: 'The full anime library, filters, and sync need an active admission card — included with the Library Pass.',
    cta: 'Get Library Pass',
  },
  scanner: {
    title: 'Unlock the Scanner',
    body: 'File scanning and organizer tools are for pass holders. Your card in inventory is the key.',
    cta: 'Get Library Pass',
  },
  quests: {
    title: 'Unlock Guild Quests',
    body: 'Daily and weekly quests open with a Library Pass. Get your card, then claim rewards from inventory.',
    cta: 'Get Library Pass',
  },
  collectibles: {
    title: 'Store finds in inventory',
    body: 'Pull collectibles and equip flair once your Library Admission Card is active.',
    cta: 'Get Library Card',
  },
  community: {
    title: 'Inventory tab locked',
    body: 'Guild inventory and trade slots unlock when you hold a Library Admission Card.',
    cta: 'Unlock with Library Pass',
  },
  membership: {
    title: 'Start your membership ladder',
    body: 'Guest → Library Pass (card in inventory) → optional app → VIP → earn Super User through tracking.',
    cta: 'Get Library Pass',
  },
  settings: {
    title: 'Billing & your card',
    body: 'Manage renewal from inventory or subscribe now to mint your Library Admission Card.',
    cta: 'Subscribe',
  },
  general: {
    title: 'Want more unlocked?',
    body: 'Get the Library Pass (~€2.50/mo). We mint your admission card to inventory — your key to member areas.',
    cta: 'Get Library Pass',
  },
};

export function getPassPromptCopy(context: PassPromptContext = 'general') {
  return COPY[context] ?? COPY.general;
}

export function markJustRegistered(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PASS_PROMPT_KEYS.JUST_REGISTERED, '1');
}

export function consumeJustRegistered(): boolean {
  if (typeof window === 'undefined') return false;
  const v = sessionStorage.getItem(PASS_PROMPT_KEYS.JUST_REGISTERED);
  if (v !== '1') return false;
  sessionStorage.removeItem(PASS_PROMPT_KEYS.JUST_REGISTERED);
  return true;
}

export function peekJustRegistered(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PASS_PROMPT_KEYS.JUST_REGISTERED) === '1';
}

export function isPassModalDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PASS_PROMPT_KEYS.MODAL_DISMISSED) === '1';
}

export function dismissPassModal(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PASS_PROMPT_KEYS.MODAL_DISMISSED, '1');
}

export function isPassBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PASS_PROMPT_KEYS.BANNER_DISMISSED) === '1';
}

export function dismissPassBanner(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PASS_PROMPT_KEYS.BANNER_DISMISSED, '1');
}

/** Routes that require an active Library Pass / card */
export const MEMBER_GATED_PATHS = ['/app/library', '/app/scanner', '/app/quests'] as const;

export function pathNeedsLibraryPass(pathname: string): boolean {
  return MEMBER_GATED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}
