// Core Types for Otaku Gildija LT

export interface AnimeItem {
  id: string;
  title: string;
  titleEnglish?: string;
  titleRomaji?: string;
  titleLT?: string;
  
  resolution?: '480p' | '720p' | '1080p' | '2160p' | '4K';
  codec?: 'H.264' | 'HEVC' | 'AV1' | 'VP9';
  type: 'Series' | 'Movie' | 'OVA' | 'Special';
  
  genres?: string[];
  studios?: string[];
  author?: string; 
  director?: string;
  season?: string; 
  year?: number;
  
  episodes: number;
  watched: number;
  progress: number; 
  missing: number;
  
  coverImage?: string;
  bannerImage?: string;
  
  status?: 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped' | 'On Hold';
  
  averageScore?: number; 
  rating?: number; 
  
  fileSize?: string;
  filePath?: string;
  addedDate?: string;
  lastWatched?: string;
  
  tags?: string[];
  malId?: number;
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

export type UserTier = 'free' | 'premium';

export interface UserState {
  tier: UserTier;
  purchaseDate?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  category: string;
  type?: string;
  tags?: string[];
  image: string;
  readTime?: string;
  rating?: number;
}

export interface PersonalBlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: 'Review' | 'Thoughts' | 'Guide' | 'List' | 'Analysis';
  status: 'draft' | 'published' | 'private';
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  itemLevel?: number;
  attributes?: Record<string, any>;
  type?: string;
  description?: string;
  icon?: string;
}

export interface UserGachaState {
  userId: string;
  accountLevel: number;
  pityModifier: number;
  softPityCount: number;
  guaranteedBannerItem: boolean;
  arcaneDust: number;
  inventory: GachaItem[];
}

export type MediaItem = AnimeItem;

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
  preferences: { theme: string; notifications: boolean };
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  rewardXp: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
  progress: number;
  maxProgress: number;
}

export interface WatchListItem {
  id: string;
  title: string;
  status: string;
  progress: number;
  rating?: number;
  lastUpdate: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

export interface ExtendedWatchListItem extends WatchListItem {
    image?: string;
    episodes?: number;
}
