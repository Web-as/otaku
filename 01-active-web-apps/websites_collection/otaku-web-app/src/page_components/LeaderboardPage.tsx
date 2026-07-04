import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { gamificationAPI } from '../services/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  role: string;
  tier: string;
}

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('weekly');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gamificationAPI.getLeaderboard(period);
      setLeaderboard(response.data.leaderboard || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500';
      case 2: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500';
      default: return 'bg-gray-900 border-gray-800';
    }
  };

  const getTierBadge = (tier: string) => {
    return tier === 'premium' ? (
      <span className="px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded">
        PREMIUM
      </span>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-400">Top players ranked by points earned</p>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-4 mb-8">
          {['daily', 'weekly', 'monthly', 'total'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
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
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No rankings yet</h3>
            <p className="text-gray-500">Be the first to earn points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="pt-8">
                  <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-2 border-gray-500 rounded-lg p-6 text-center">
                    <Medal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-1">{leaderboard[1].username}</h3>
                    <p className="text-2xl font-black text-gray-400">{leaderboard[1].points}</p>
                    <p className="text-xs text-gray-500 uppercase">Points</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-lg p-6 text-center">
                    <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                    <h3 className="font-bold text-xl mb-1">{leaderboard[0].username}</h3>
                    <p className="text-3xl font-black text-yellow-400">{leaderboard[0].points}</p>
                    <p className="text-xs text-gray-500 uppercase">Points</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="pt-16">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500 rounded-lg p-6 text-center">
                    <Medal className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                    <h3 className="font-bold mb-1">{leaderboard[2].username}</h3>
                    <p className="text-xl font-black text-orange-400">{leaderboard[2].points}</p>
                    <p className="text-xs text-gray-500 uppercase">Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`border rounded-lg p-4 flex items-center justify-between ${getRankBg(entry.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{entry.username}</h3>
                        {getTierBadge(entry.tier)}
                      </div>
                      <p className="text-sm text-gray-400 capitalize">{entry.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-black">{entry.points}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
