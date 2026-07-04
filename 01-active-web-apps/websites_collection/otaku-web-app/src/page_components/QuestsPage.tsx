import { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Award, Loader2, AlertCircle, Bot, Zap, Flame } from 'lucide-react';
import { gamificationAPI, api } from '../services/api';

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  requirement: Record<string, any>;
  reward_type: string;
  reward_points: number;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'claimed';
}

const QuestsPage = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeBounty, setActiveBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    fetchQuests();
  }, [filter]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gamificationAPI.getQuests(filter === 'all' ? undefined : filter);
      setQuests(response.data);
      
      // Fetch dynamic bounty
      try {
        const bountyRes = await api.get('/api/v1/gamification/bounties/generate');
        if (bountyRes.data && bountyRes.data.bounty) {
            setActiveBounty(bountyRes.data.bounty);
        }
      } catch (e) {
          console.warn("Failed to fetch dynamic bounty");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      await gamificationAPI.claimQuest(questId);
      await fetchQuests();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to claim quest');
    }
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-5 h-5" />;
      case 'weekly': return <Target className="w-5 h-5" />;
      case 'monthly': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getQuestColor = (type: string) => {
    switch (type) {
      case 'daily': return 'from-blue-500 to-cyan-500';
      case 'weekly': return 'from-purple-500 to-pink-500';
      case 'monthly': return 'from-orange-500 to-red-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Quest Board
            </h1>
            <p className="text-gray-400">Complete quests to earn points and unlock rewards</p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
             <Trophy className="w-6 h-6 text-yellow-500" />
             <div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Rank</div>
                <div className="font-mono text-white">Gold Tier</div>
             </div>
          </div>
        </div>

        {/* AI Bounty Board (Epic Overhaul) */}
        {activeBounty && (
        <div className="mb-12 relative overflow-hidden rounded-xl border border-pink-500/50 bg-gray-900 p-1">
           <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-pink-500/10 animate-pulse"></div>
           <div className="relative bg-[#111] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                 <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-5 h-5 text-pink-500" />
                    <span className="text-pink-500 font-mono text-xs font-bold uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Omniscient Target Detected</span>
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{activeBounty.title}</h2>
                 <p className="text-gray-400 text-sm max-w-2xl">
                    {activeBounty.description}
                 </p>
              </div>
              <div className="flex flex-col items-center sm:items-end w-full md:w-auto">
                 <div className="flex items-center space-x-2 mb-4 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg">
                    <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span className="font-bold text-yellow-400 font-mono">+{activeBounty.reward_coins} Guild Coins</span>
                 </div>
                 <button className="w-full sm:w-auto px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(236,72,153,0.4)] transition hover:scale-105 flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" /> Accept Target
                 </button>
              </div>
           </div>
        </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {['all', 'daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
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
            <p className="text-gray-400">Loading quests...</p>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No quests available</h3>
            <p className="text-gray-500">Check back later for new quests!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-violet-500 transition"
              >
                {/* Quest Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getQuestColor(quest.quest_type)}`}>
                    {getQuestIcon(quest.quest_type)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {quest.quest_type}
                  </span>
                </div>

                {/* Quest Info */}
                <h3 className="text-lg font-bold mb-2">{quest.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{quest.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">
                      {quest.progress} / {quest.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getQuestColor(quest.quest_type)}`}
                      style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-yellow-400">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span className="font-bold">{quest.reward_points} pts</span>
                  </div>

                  {/* Action Button */}
                  {quest.status === 'completed' ? (
                    <button
                      onClick={() => handleClaimQuest(quest.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Claim Reward
                    </button>
                  ) : quest.status === 'claimed' ? (
                    <span className="px-4 py-2 bg-gray-800 text-gray-500 text-sm font-semibold rounded-lg">
                      Claimed
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gray-800 text-gray-400 text-sm font-semibold rounded-lg">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestsPage;
