import { AnimeItem, SortOption, FilterOptions } from '../types/types';

// Advanced sorting function
export function sortAnime(
  items: AnimeItem[],
  sortBy: SortOption,
  sortOrder: 'asc' | 'desc'
): AnimeItem[] {
  const sorted = [...items].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'title':
        compareValue = (a.titleLT || a.title).localeCompare(b.titleLT || b.title, 'lt');
        break;
      case 'year':
        compareValue = a.year - b.year;
        break;
      case 'rating':
        compareValue = (a.rating || 0) - (b.rating || 0);
        break;
      case 'progress':
        compareValue = a.progress - b.progress;
        break;
      case 'addedDate':
        compareValue = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
        break;
      case 'lastWatched':
        const dateA = a.lastWatched ? new Date(a.lastWatched).getTime() : 0;
        const dateB = b.lastWatched ? new Date(b.lastWatched).getTime() : 0;
        compareValue = dateA - dateB;
        break;
      case 'episodes':
        compareValue = a.episodes - b.episodes;
        break;
      case 'fileSize':
        compareValue = parseFileSize(a.fileSize || '0') - parseFileSize(b.fileSize || '0');
        break;
      case 'studio':
        compareValue = (a.studios[0] || '').localeCompare(b.studios[0] || '');
        break;
      case 'genre':
        compareValue = (a.genres[0] || '').localeCompare(b.genres[0] || '');
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

// Advanced filtering function
export function filterAnime(items: AnimeItem[], filters: FilterOptions): AnimeItem[] {
  let filtered = [...items];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.titleLT?.toLowerCase().includes(searchLower) ||
        item.titleEnglish?.toLowerCase().includes(searchLower) ||
        item.titleRomaji?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        item.genres.some(genre => genre.toLowerCase().includes(searchLower))
    );
  }

  // Genre filter
  if (filters.genres.length > 0) {
    filtered = filtered.filter(item =>
      filters.genres.some(genre => item.genres.includes(genre))
    );
  }

  // Studio filter
  if (filters.studios.length > 0) {
    filtered = filtered.filter(item =>
      filters.studios.some(studio => item.studios.includes(studio))
    );
  }

  // Resolution filter
  if (filters.resolutions.length > 0) {
    filtered = filtered.filter(item => filters.resolutions.includes(item.resolution));
  }

  // Type filter
  if (filters.types.length > 0) {
    filtered = filtered.filter(item => filters.types.includes(item.type));
  }

  // Status filter
  if (filters.statuses.length > 0) {
    filtered = filtered.filter(item => filters.statuses.includes(item.status));
  }

  // Year filter
  if (filters.years.length > 0) {
    filtered = filtered.filter(item => filters.years.includes(item.year));
  }

  // Apply sorting
  filtered = sortAnime(filtered, filters.sortBy, filters.sortOrder);

  return filtered;
}

// Auto-organize function (groups by studio/genre)
export function autoOrganize(items: AnimeItem[], groupBy: 'studio' | 'genre' | 'year' | 'status'): Map<string, AnimeItem[]> {
  const organized = new Map<string, AnimeItem[]>();

  items.forEach(item => {
    let keys: string[] = [];

    switch (groupBy) {
      case 'studio':
        keys = item.studios;
        break;
      case 'genre':
        keys = item.genres;
        break;
      case 'year':
        keys = [item.year.toString()];
        break;
      case 'status':
        keys = [item.status];
        break;
    }

    keys.forEach(key => {
      if (!organized.has(key)) {
        organized.set(key, []);
      }
      organized.get(key)!.push(item);
    });
  });

  return organized;
}

// Helper function to parse file size string
function parseFileSize(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  const multipliers: { [key: string]: number } = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };

  return value * (multipliers[unit] || 1);
}

// Calculate library statistics
export function calculateStats(items: AnimeItem[]) {
  const totalSize = items.reduce((sum, item) => {
    return sum + parseFileSize(item.fileSize || '0');
  }, 0);

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
    } else if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalEpisodes = items.reduce((sum, item) => sum + item.episodes, 0);
  const watchedEpisodes = items.reduce((sum, item) => sum + item.watched, 0);
  const completedSeries = items.filter(item => item.progress === 100).length;
  const averageRating = items.reduce((sum, item) => sum + (item.rating || 0), 0) / items.filter(item => item.rating).length;

  return {
    totalItems: items.length,
    totalSize: formatSize(totalSize),
    completedSeries,
    totalEpisodes,
    watchedEpisodes,
    averageRating: Math.round(averageRating * 10) / 10,
    by4K: items.filter(item => item.resolution === '4K' || item.resolution === '2160p').length,
    by1080p: items.filter(item => item.resolution === '1080p').length,
    by720p: items.filter(item => item.resolution === '720p').length
  };
}

// Get unique authors from library
export function getUniqueAuthors(items: AnimeItem[]): string[] {
  const authors = new Set<string>();
  items.forEach(item => {
    if (item.author) authors.add(item.author);
  });
  return Array.from(authors).sort();
}

// Get unique directors from library
export function getUniqueDirectors(items: AnimeItem[]): string[] {
  const directors = new Set<string>();
  items.forEach(item => {
    if (item.director) directors.add(item.director);
  });
  return Array.from(directors).sort();
}

