/**
 * Unified Types for Otaku Gildija
 * Combines types from otaku-gildija-website (library) and otaku-gildija-lt (features)
 */

// Declaration for global variables injected by environment
declare global {
  const __app_id: string | undefined;
  const __firebase_config: string | undefined;
  const __initial_auth_token: string | undefined;
}

// ============================================
// ANIME & LIBRARY TYPES (from website)
// ============================================

export interface AnimeItem {
  id: string;
  title: string;
  titleEnglish?: string;
  titleRomaji?: string;
  titleLT?: string;

  // Technical Details
  resolution: '480p' | '720p' | '1080p' | '2160p' | '4K';
  codec: 'H.264' | 'HEVC' | 'AV1' | 'VP9';
  type: 'Series' | 'Movie' | 'OVA' | 'Special';

  // Metadata
  genres: string[];
  studios: string[];
  author?: string;
  director?: string;
  season?: string;
  year: number;

  // Progress
  episodes: number;
  watched: number;
  progress: number;
  missing: number;

  // Media
  coverImage?: string;
  bannerImage?: string;

  // Status
  status: 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped' | 'On Hold';

  // Quality
  averageScore?: number;
  rating?: number;

  // File Info
  fileSize?: string;
  filePath?: string;
  addedDate: string;
  lastWatched?: string;

  // Tags
  tags: string[];
}

export interface FilterOptions {
  search: string;
  genres: string[];
  studios: string[];
  resolutions: string[];
  types: string[];
  statuses: string[];
  years: number[];
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'compact';
}

export type SortOption =
  | 'title'
  | 'year'
  | 'rating'
  | 'progress'
  | 'addedDate'
  | 'lastWatched'
  | 'episodes'
  | 'fileSize'
  | 'studio'
  | 'genre';

export interface LibraryStats {
  totalItems: number;
  totalSize: string;
  completedSeries: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  averageRating: number;
  by4K: number;
  by1080p: number;
  by720p: number;
}

// ============================================
// USER & SUBSCRIPTION TYPES
// ============================================

export type UserTier = 'free' | 'premium';

export interface UserState {
  tier: UserTier;
  purchaseDate?: string;
}

// ============================================
// MEDIA TYPES (from LT - extended)
// ============================================

export interface MediaItem {
  id: string;
  title: string;
  resolution: string;
  type: 'Series' | 'Movie';
  progress: number;
  episodes: number;
  watched: number;
  missing: number;
  tags: string[];
  coverImage?: string;
  malId?: number;

  // Extended Metadata
  description?: string;
  bannerImage?: string;
  season?: string;
  seasonYear?: number;
  status?: string;
  averageScore?: number;
  studios?: string[];
  nextAiringEpisode?: {
    episode: number;
    timeUntilAiring: number;
  };
  trailer?: {
    id: string;
    site: string;
  };
}

// ============================================
// GAMIFICATION TYPES (from LT)
// ============================================

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface GachaItem {
  id: string;
  name: string;
  type: 'Chibi' | 'Theme' | 'Banner';
  rarity: Rarity;
  icon?: string;
  description: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  organizedFiles: number;
  completedSeries: number;
  badges: string[];
  avatarUrl: string;
  coins: number;
  equippedChibi?: string;
  inventory: string[];
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'Daily' | 'Weekly';
  rewardXp: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
  progress: number;
  maxProgress: number;
}

// ============================================
// SYNC & DEVICE TYPES (from LT)
// ============================================

export interface WatchEntry {
  id: string;
  userId: string;
  seriesId?: string;
  fileHash: string;
  episodeNumber: number;
  positionSeconds: number;
  durationSeconds: number;
  watchedAt: string;
  sourceDeviceId: string;
}

export interface WatchListItem {
  id: string;
  title: string;
  status: string;
  progress: number;
  rating?: number;
  lastUpdate: string;
}

export interface XPEvent {
  id: string;
  userId: string;
  eventType: string;
  amount: number;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface Device {
  id: string;
  userId?: string;
  name: string;
  platform: 'Windows' | 'Android' | 'Server';
  status: 'online' | 'offline' | 'syncing';
  lastSeen: string;
  lastServerSeq: number;
  ipAddress: string;
  version: string;
  currentTask?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  message: string;
  source: 'System' | 'Windows' | 'Android' | 'FastAPI' | 'Postgres';
  type: 'info' | 'success' | 'warning' | 'error';
  details?: string;
}

// ============================================
// ACTIVITY & COMMUNITY TYPES (from LT)
// ============================================

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  data: string;
  type: 'achievement' | 'review' | 'list_update';
  timestamp: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  image?: string;
  rating?: number;
  type?: string;
  tags?: string[];
}

// ============================================
// SHOP TYPES (from LT)
// ============================================

export interface ShopProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category: 'Apparel' | 'Figure' | 'Accessory';
}

export interface CartItem extends ShopProduct {
  quantity: number;
}
