'use client';

import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { Star, Sparkles, Crown, Loader2, AlertCircle } from 'lucide-react';
import { gamificationAPI } from '../services/api';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';
import { useGamificationOptional } from '@/shared/gamification/GamificationContext';
import { GachaWarpBanner } from '@/shared/components/gacha/GachaWarpBanner';
import { RARITY_TAILWIND, normalizeRarity, rarityStyle } from '@/shared/gamification/rarityTokens';
import '@/shared/styles/landing-anime.css';

interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'chibi' | 'badge' | 'avatar' | 'theme' | 'item';
  image_url: string;
  unlock_condition: string;
  unlocked_at: string;
  is_equipped: boolean;
}

const CollectiblesPage = () => {
  const { status } = useMembership();
  const game = useGamificationOptional();
  const hasPass = status ? canAccessMemberLibrary(status) : false;
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'chibi' | 'badge' | 'avatar' | 'theme'>('all');
  
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticPullFlash, setOptimisticPullFlash] = useOptimistic(
    false,
    (_state, next: boolean) => next,
  );

  useEffect(() => {
    fetchCollectibles();
  }, []);

  const fetchCollectibles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gamificationAPI.getCollectibles();
      setCollectibles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load collectibles');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (collectibleId: string) => {
    try {
      await gamificationAPI.equipCollectible(collectibleId);
      await fetchCollectibles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to equip collectible');
    }
  };

  const handlePull = async () => {
    startTransition(() => {
      setOptimisticPullFlash(true);
    });
    try {
      setIsPulling(true);
      setPullResult(null);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = await gamificationAPI.pullGacha();
      setPullResult(response.data);
      game?.addGold(-160, 'Gacha warp pull');
      game?.addXp(160, 'Gacha warp pull', { eventType: 'GACHA_PULLED' });
      await fetchCollectibles();
    } catch {
      alert('Failed to pull gacha');
    } finally {
      setIsPulling(false);
      startTransition(() => setOptimisticPullFlash(false));
    }
  };

  const getRarityColor = (rarity: string) => {
    const r = normalizeRarity(rarity);
    const t = RARITY_TAILWIND[r];
    return `border-2 ${t.border} ${t.text}`;
  };

  const getRarityGradient = (rarity: string) => {
    const r = normalizeRarity(rarity);
    return RARITY_TAILWIND[r].gradient;
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4" />;
      case 'epic': return <Sparkles className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const filteredCollectibles = filter === 'all'
    ? collectibles
    : collectibles.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {!hasPass && (
          <div className="mb-6">
            <LibraryPassCTA variant="inline" context="collectibles" hasPass={hasPass} />
          </div>
        )}

        {/* Header */}
        <GachaWarpBanner active={isPulling || optimisticPullFlash} className="mb-6" />

        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Collectibles Gallery
            </h1>
            <p className="text-gray-400">Your unlocked items and achievements</p>
          </div>
          <button
            onClick={handlePull}
            disabled={isPulling || isPending}
            className={`theme-cta-primary px-8 py-3 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              optimisticPullFlash ? 'scale-105 ring-2 ring-amber-400/50' : ''
            }`}
          >
            <Sparkles className="w-5 h-5" />
            {isPulling || isPending ? 'Summoning…' : 'WARP PULL (160 Coins)'}
          </button>
        </div>

        {/* Cinematic Overlay */}
        {isPulling && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center theme-glass-modal animate-fade-in">
            <div className="text-center">
              <div className="w-24 h-24 border-4 border-violet-500 border-t-pink-500 rounded-full animate-spin mx-auto mb-8"></div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 animate-pulse tracking-widest">
                WARPING THROUGH THE ASTRAL PLANE...
              </h2>
            </div>
          </div>
        )}

        {/* Pull Result Modal */}
        {pullResult && !isPulling && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center theme-glass-modal">
            <div
              className={`theme-card border-4 p-8 max-w-sm w-full text-center transform shadow-2xl ${getRarityColor(pullResult.rarity)}`}
              style={rarityStyle(pullResult.rarity)}
            >
              <div className="mb-6 flex justify-center">
                <div className={`p-4 rounded-full bg-gradient-to-br ${getRarityGradient(pullResult.rarity)}`}>
                  {getRarityIcon(pullResult.rarity)}
                </div>
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase">{pullResult.rarity} DROP!</h2>
              <p className="text-xl font-bold text-white mb-6">{pullResult.item.name}</p>
              
              <button 
                onClick={() => setPullResult(null)}
                className="w-full py-3 bg-white text-black font-black uppercase tracking-widest rounded hover:bg-gray-200 transition"
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {['all', 'chibi', 'badge', 'avatar', 'theme'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                filter === type
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading collectibles...</p>
          </div>
        ) : filteredCollectibles.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No collectibles yet</h3>
            <p className="text-gray-500">Complete quests to unlock collectibles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCollectibles.map((collectible) => (
              <div
                key={collectible.id}
                className={`bg-gray-900 border-2 rounded-lg p-4 hover:scale-105 transition ${getRarityColor(collectible.rarity)}`}
              >
                {/* Rarity Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getRarityGradient(collectible.rarity)}`}>
                    {getRarityIcon(collectible.rarity)}
                    <span className="uppercase">{collectible.rarity}</span>
                  </div>
                  {collectible.is_equipped && (
                    <span className="text-xs font-bold text-green-400">EQUIPPED</span>
                  )}
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {collectible.image_url ? (
                    <img
                      src={collectible.image_url}
                      alt={collectible.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Star className="w-12 h-12 text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold mb-1 truncate">{collectible.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{collectible.description}</p>

                {/* Action Button */}
                {(collectible.category === 'avatar' || collectible.category === 'theme') && (
                  <button
                    onClick={() => handleEquip(collectible.id)}
                    disabled={collectible.is_equipped}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                      collectible.is_equipped
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    {collectible.is_equipped ? 'Equipped' : 'Equip'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectiblesPage;
