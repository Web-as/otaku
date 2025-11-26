
// Declaration for global variables injected by environment
declare global {
  const __app_id: string | undefined;
  const __firebase_config: string | undefined;
  const __initial_auth_token: string | undefined;
}

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
}

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface GachaItem {
  id: string;
  name: string;
  type: 'Chibi' | 'Theme' | 'Banner';
  rarity: Rarity;
  icon?: string;
  description: string;
}

// Aligned with SQL 'users' table and gamification logic
export interface UserProfile {
  id: string; // UUID
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
  preferences: Record<string, any>; // JSONB
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

// Aligned with SQL 'watch_entries' table
export interface WatchEntry {
  id: string; // UUID
  userId: string;
  seriesId?: string;
  fileHash: string;
  episodeNumber: number;
  positionSeconds: number;
  durationSeconds: number;
  watchedAt: string; // ISO Timestamp
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

// Aligned with SQL 'xp_events' table
export interface XPEvent {
  id: string;
  userId: string;
  eventType: string; // e.g., 'watched_episode', 'organized_file'
  amount: number;
  meta: Record<string, any>;
  createdAt: string;
}

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

// Aligned with SQL 'devices' table
export interface Device {
  id: string; // UUID
  userId?: string;
  name: string; // device_name
  platform: 'Windows' | 'Android' | 'Server'; // device_type
  status: 'online' | 'offline' | 'syncing';
  lastSeen: string;
  lastServerSeq: number; // For oplog sync
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