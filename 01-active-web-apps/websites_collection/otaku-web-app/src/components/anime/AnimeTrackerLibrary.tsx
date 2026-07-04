import React, { useState } from 'react';
import { Plus, Search, Grid, List, Loader2 } from 'lucide-react';
import { useAnime } from '../../hooks/useAnime';
import AnimeSearchModal from './AnimeSearchModal';
import AnimeCard from './AnimeCard';
import TrendingAnime from './TrendingAnime';
import TrackerBlogSyncBar from '../tracker/TrackerBlogSyncBar';
import CompletesSection from '../tracker/CompletesSection';
import { getCurrentUser } from '@/lib/firebase';
import { getUserProfile } from '@/shared/supabase/database';
import TrackerBlogSyncModal from '../tracker/TrackerBlogSyncModal';
import type { AnimeItem } from '../../types/types';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useMembership } from '@/hooks/useMembership';
import LibraryPassCTA from '../membership/LibraryPassCTA';

const AnimeTrackerLibrary: React.FC = () => {
  const { anime, loading, error, refetch } = useAnime();
  const [profile, setProfile] = React.useState<Awaited<ReturnType<typeof getUserProfile>>>(null);

  const refreshProfile = React.useCallback(() => {
    const u = getCurrentUser();
    if (!u?.uid) return;
    getUserProfile(u.uid).then(setProfile).catch(() => undefined);
  }, []);

  React.useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const currentUser = getCurrentUser();
  const profileFilter = React.useMemo(() => {
    return currentUser?.uid ? `id=eq.${currentUser.uid}` : undefined;
  }, [currentUser?.uid]);

  useSupabaseRealtime(
    {
      table: 'user_profiles',
      filter: profileFilter,
    },
    refreshProfile
  );

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncAnime, setSyncAnime] = useState<AnimeItem | null>(null);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);

  const { status } = useMembership();
  const isPremium = status?.hasValidPass;
  const AT_LIMIT = !isPremium && anime.length >= 10;

  const statuses = ['all', 'Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'];

  const filteredAnime = anime.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: anime.length,
    watching: anime.filter(a => a.status === 'Watching').length,
    completed: anime.filter(a => a.status === 'Completed').length,
    planToWatch: anime.filter(a => a.status === 'Plan to Watch').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0e17]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
                My Anime Library
              </h1>
              <p className="text-sm text-gray-500 font-mono uppercase tracking-widest mt-1">
                Track your anime journey
              </p>
            </div>
            <button
              onClick={() => {
                if (AT_LIMIT) {
                  setShowUpgradeGate(true);
                } else {
                  setShowSearchModal(true);
                }
              }}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Anime
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-violet-400">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Anime</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.watching}</div>
              <div className="text-sm text-gray-500">Watching</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.planToWatch}</div>
              <div className="text-sm text-gray-500">Plan to Watch</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none transition"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>

              <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition ${
                    viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition ${
                    viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TrackerBlogSyncBar />
        <CompletesSection profile={profile} />

        {/* Trending Anime Section - Always show */}
        <div className="mb-12">
          <TrendingAnime />
        </div>

        {/* Divider */}
        {anime.length > 0 && (
          <div className="border-t border-gray-800 my-12">
            <h2 className="text-2xl font-bold mt-8 mb-6">My Library</h2>
          </div>
        )}

        {/* Library Content */}
        {filteredAnime.length === 0 && anime.length > 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No anime found' : 'Your library is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Start tracking your anime journey by adding some titles'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => {
                  if (AT_LIMIT) {
                    setShowUpgradeGate(true);
                  } else {
                    setShowSearchModal(true);
                  }
                }}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Anime
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'
              : 'space-y-3'
          }>
            {filteredAnime.map(item => (
              <AnimeCard
                key={item.id}
                anime={item}
                viewMode={viewMode}
                onBlogSync={setSyncAnime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <AnimeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAnimeAdded={() => {
          refetch();
          setShowSearchModal(false);
        }}
      />

      <TrackerBlogSyncModal anime={syncAnime} onClose={() => setSyncAnime(null)} />

      {showUpgradeGate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0a0a0c] border border-gray-800 rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => setShowUpgradeGate(false)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white bg-black/50 rounded-full p-2"
            >
              Close
            </button>
            <LibraryPassCTA variant="gate" context="library" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeTrackerLibrary;
