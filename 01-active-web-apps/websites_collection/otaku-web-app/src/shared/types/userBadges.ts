// User badges and titles system - shared across all 3 sites

export type BadgeType = 
  | 'pre_registered'
  | 'founder'
  | 'premium'
  | 'contributor'
  | 'moderator'
  | 'verified'
  | 'anime_expert'
  | 'blogger'
  | 'early_adopter';

export type UserTitle = 
  | 'Pre-Registered Member'
  | 'Founder'
  | 'Premium Member'
  | 'Contributor'
  | 'Moderator'
  | 'Verified User'
  | 'Anime Expert'
  | 'Blogger'
  | 'Early Adopter'
  | 'Member';

export interface UserBadge {
  type: BadgeType;
  title: UserTitle;
  description: string;
  color: string; // Tailwind color class
  icon: string; // Emoji or icon identifier
  earned_at: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  tier: 'free' | 'premium' | 'pro';
  
  // Badges and titles
  badges: BadgeType[];
  active_title?: UserTitle;
  
  // Metadata
  created_at: string;
  updated_at?: string;
  last_seen?: string;
}

// Badge definitions
export const BADGE_DEFINITIONS: Record<BadgeType, Omit<UserBadge, 'earned_at'>> = {
  pre_registered: {
    type: 'pre_registered',
    title: 'Pre-Registered Member',
    description: 'Joined during the early access period',
    color: 'bg-purple-500',
    icon: '🌟',
  },
  founder: {
    type: 'founder',
    title: 'Founder',
    description: 'One of the first members',
    color: 'bg-yellow-500',
    icon: '👑',
  },
  premium: {
    type: 'premium',
    title: 'Premium Member',
    description: 'Active premium subscription',
    color: 'bg-blue-500',
    icon: '💎',
  },
  contributor: {
    type: 'contributor',
    title: 'Contributor',
    description: 'Contributed to the community',
    color: 'bg-green-500',
    icon: '✨',
  },
  moderator: {
    type: 'moderator',
    title: 'Moderator',
    description: 'Community moderator',
    color: 'bg-red-500',
    icon: '🛡️',
  },
  verified: {
    type: 'verified',
    title: 'Verified User',
    description: 'Verified account',
    color: 'bg-cyan-500',
    icon: '✓',
  },
  anime_expert: {
    type: 'anime_expert',
    title: 'Anime Expert',
    description: 'Extensive anime knowledge',
    color: 'bg-pink-500',
    icon: '🎌',
  },
  blogger: {
    type: 'blogger',
    title: 'Blogger',
    description: 'Active blog contributor',
    color: 'bg-indigo-500',
    icon: '✍️',
  },
  early_adopter: {
    type: 'early_adopter',
    title: 'Early Adopter',
    description: 'Joined in the first month',
    color: 'bg-orange-500',
    icon: '🚀',
  },
};

/**
 * Get badge definition with earned_at timestamp
 */
export const getBadge = (type: BadgeType, earnedAt: string = new Date().toISOString()): UserBadge => {
  return {
    ...BADGE_DEFINITIONS[type],
    earned_at: earnedAt,
  };
};

/**
 * Check if user should get pre-registered badge
 * All users who sign up before a certain date get this badge
 */
export const shouldGetPreRegisteredBadge = (): boolean => {
  // For now, everyone gets it (early access period)
  // Later, you can set a cutoff date
  const cutoffDate = new Date('2026-03-01'); // Example: March 1, 2026
  return new Date() < cutoffDate;
};

/**
 * Get default title for user
 */
export const getDefaultTitle = (badges: BadgeType[]): UserTitle => {
  // Priority order for titles
  if (badges.includes('founder')) return 'Founder';
  if (badges.includes('moderator')) return 'Moderator';
  if (badges.includes('pre_registered')) return 'Pre-Registered Member';
  if (badges.includes('premium')) return 'Premium Member';
  if (badges.includes('blogger')) return 'Blogger';
  if (badges.includes('anime_expert')) return 'Anime Expert';
  if (badges.includes('contributor')) return 'Contributor';
  if (badges.includes('verified')) return 'Verified User';
  if (badges.includes('early_adopter')) return 'Early Adopter';
  return 'Member';
};
