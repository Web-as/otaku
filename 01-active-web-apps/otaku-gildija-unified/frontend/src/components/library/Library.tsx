import React, { useState, useMemo } from 'react';
import { Search, Grid, List, SlidersHorizontal, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { AnimeItem, FilterOptions, SortOption } from '../../types/types';
import { ANIME_LIBRARY, AVAILABLE_GENRES, AVAILABLE_STUDIOS, AVAILABLE_YEARS, AVAILABLE_RESOLUTIONS, AVAILABLE_TYPES, AVAILABLE_STATUSES } from '../../data/animeData';
import { filterAnime, calculateStats, autoOrganize, getUniqueAuthors, getUniqueDirectors } from '../../utils/sorting';
import AnimeCard from './AnimeCard';
import FilterPanel from './FilterPanel';
import StatsBar from './StatsBar';

const Library: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    genres: [],
    studios: [],
    resolutions: [],
    types: [],
    statuses: [],
    years: [],
    sortBy: 'title',
    sortOrder: 'asc',
    viewMode: 'grid'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'studio' | 'genre' | 'year' | 'status'>('none');

  // Get unique authors and directors
  const authors = useMemo(() => getUniqueAuthors(ANIME_LIBRARY), []);
  const directors = useMemo(() => getUniqueDirectors(ANIME_LIBRARY), []);

  // Filter and sort anime
  const filteredAnime = useMemo(() => filterAnime(ANIME_LIBRARY, filters), [filters]);

  // Organize anime if grouping is enabled
  const organizedAnime = useMemo(() => {
    if (groupBy === 'none') return null;
    return autoOrganize(filteredAnime, groupBy);
  }, [filteredAnime, groupBy]);

  // Calculate statistics
  const stats = useMemo(() => calculateStats(filteredAnime), [filteredAnime]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: 'genres' | 'studios' | 'resolutions' | 'types' | 'statuses' | 'years', value: any) => {
    setFilters(prev => {
      const currentArray = prev[key] as any[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genres: [],
      studios: [],
      resolutions: [],
      types: [],
      statuses: [],
      years: [],
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      viewMode: filters.viewMode
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.genres.length > 0 || 
    filters.studios.length > 0 || 
    filters.resolutions.length > 0 || 
    filters.types.length > 0 || 
    filters.statuses.length > 0 || 
    filters.years.length > 0;

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0e17]/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Premium Success Banner */}
          <div className="mb-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <p className="text-sm font-bold text-green-300">Premium Aktyvus</p>
              <p className="text-xs text-green-600">Visiškai organizuota biblioteka su visomis funkcijomis!</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-yellow-500 text-black text-xs font-black rounded uppercase">€1 Investicija</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
                Anime Biblioteka
              </h1>
              <p className="text-sm text-gray-500 font-mono uppercase tracking-widest mt-1">
                {filteredAnime.length} iš {ANIME_LIBRARY.length} anime
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                <button
                  onClick={() => handleFilterChange('viewMode', 'grid')}
                  className={`p-2 rounded transition ${
                    filters.viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFilterChange('viewMode', 'list')}
                  className={`p-2 rounded transition ${
                    filters.viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  showFilters
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">Filtrai</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Ieškoti anime, žanro, studijos, žymių..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-12 py-3 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none transition"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Sort By */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-gray-700 transition">
                <ArrowUpDown className="w-3 h-3" />
                Rūšiuoti: {getSortLabel(filters.sortBy)}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {(['title', 'year', 'rating', 'progress', 'addedDate', 'lastWatched', 'episodes'] as SortOption[]).map(sort => (
                  <button
                    key={sort}
                    onClick={() => handleFilterChange('sortBy', sort)}
                    className={`w-full text-left px-4 py-2 text-xs uppercase font-bold hover:bg-gray-800 transition ${
                      filters.sortBy === sort ? 'text-violet-400' : 'text-gray-400'
                    }`}
                  >
                    {getSortLabel(sort)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-gray-700 transition"
            >
              {filters.sortOrder === 'asc' ? '↑ Didėjimo tvarka' : '↓ Mažėjimo tvarka'}
            </button>

            {/* Group By */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-gray-700 transition">
                Grupuoti: {groupBy === 'none' ? 'Nėra' : groupBy === 'studio' ? 'Studijos' : groupBy === 'genre' ? 'Žanrai' : groupBy === 'year' ? 'Metai' : 'Būsena'}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {(['none', 'studio', 'genre', 'year', 'status'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setGroupBy(option)}
                    className={`w-full text-left px-4 py-2 text-xs uppercase font-bold hover:bg-gray-800 transition ${
                      groupBy === option ? 'text-violet-400' : 'text-gray-400'
                    }`}
                  >
                    {option === 'none' ? 'Nėra' : option === 'studio' ? 'Studijos' : option === 'genre' ? 'Žanrai' : option === 'year' ? 'Metai' : 'Būsena'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-red-900/20 border border-red-800 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-900/30 transition"
              >
                <X className="w-3 h-3 inline mr-1" />
                Išvalyti filtrus
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Filter Panel (Sidebar) */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onToggleMultiSelect={toggleMultiSelect}
          onClose={() => setShowFilters(false)}
          availableGenres={AVAILABLE_GENRES}
          availableStudios={AVAILABLE_STUDIOS}
          availableYears={AVAILABLE_YEARS}
          availableResolutions={AVAILABLE_RESOLUTIONS}
          availableTypes={AVAILABLE_TYPES}
          availableStatuses={AVAILABLE_STATUSES}
          authors={authors}
          directors={directors}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredAnime.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Nerasta anime</h3>
            <p className="text-gray-600">Pabandykite pakeisti filtrus arba paieškos žodžius</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold uppercase tracking-wider transition"
              >
                Išvalyti filtrus
              </button>
            )}
          </div>
        ) : organizedAnime ? (
          // Grouped View
          <div className="space-y-12">
            {Array.from(organizedAnime.entries())
              .sort(([a], [b]) => a.localeCompare(b, 'lt'))
              .map(([group, items]) => (
                <div key={group}>
                  <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-800">
                    {group} <span className="text-sm text-gray-500 font-normal">({items.length})</span>
                  </h2>
                  <div className={
                    filters.viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'
                      : 'space-y-3'
                  }>
                    {items.map(anime => (
                      <AnimeCard key={anime.id} anime={anime} viewMode={filters.viewMode} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // Regular View
          <div className={
            filters.viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'
              : 'space-y-3'
          }>
            {filteredAnime.map(anime => (
              <AnimeCard key={anime.id} anime={anime} viewMode={filters.viewMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Helper function for sort labels
function getSortLabel(sort: SortOption): string {
  const labels: Record<SortOption, string> = {
    title: 'Pavadinimas',
    year: 'Metai',
    rating: 'Įvertinimas',
    progress: 'Progresas',
    addedDate: 'Pridėta',
    lastWatched: 'Paskutinį kartą žiūrėta',
    episodes: 'Epizodai',
    fileSize: 'Failo dydis',
    studio: 'Studija',
    genre: 'Žanras'
  };
  return labels[sort];
}

export default Library;

