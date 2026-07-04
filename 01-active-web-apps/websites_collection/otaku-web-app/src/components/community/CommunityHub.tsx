'use client';

import React, { useState, useEffect } from 'react';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';
import { useGamificationOptional } from '@/shared/gamification/GamificationContext';
import { LibrarianScoutPanel } from '@/shared/components/librarian/LibrarianScoutPanel';
import { getPublicMiniPosts } from '@/shared/miniPosts/localMiniPosts';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import type { MiniPost } from '@/shared/types/miniPost';
import '@/shared/styles/landing-anime.css';
import { Trophy, Activity, MessageSquare, Zap, Star, Share2, Copy, Check, X, Wand2, Loader, FolderOpen, PlayCircle, Coins, CalendarDays, Newspaper, ArrowRight, UserPlus } from 'lucide-react';
import { UserProfile, WatchListItem, ActivityItem, Quest, GachaItem } from '../../types/types';
import { MOCK_USERS, MOCK_QUESTS, MOCK_GACHA_ITEMS } from '../../services/mockData';
import { ProfileArtistAgent } from '../../services/aiAgent';
import ChibiCompanion from '../ChibiCompanion';
import QuestBoard from './QuestBoard';
import GachaSystem from './GachaSystem';
import GuildSchedule from './GuildSchedule';
import ReferralSystem from './ReferralSystem';
import { useLanguage } from '../../services/i18n';
import { gamificationAPI } from '../../services/api';

const MOCK_WATCHLIST: WatchListItem[] = [
    { id: 'l1', title: 'Jujutsu Kaisen', status: 'Watching', progress: 75, rating: 9, lastUpdate: '2025-11-20' },
    { id: 'l2', title: 'Death Note', status: 'Completed', progress: 100, rating: 10, lastUpdate: '2024-05-15' },
    { id: 'l3', title: 'Mushoku Tensei', status: 'Plan to Watch', progress: 0, rating: undefined, lastUpdate: '2025-11-25' },
];

const MOCK_ACTIVITY_FEED: ActivityItem[] = [
    { id: 'a1', user: 'User123', action: 'atrakino medalį', data: 'Data Hoarder IV', type: 'achievement', timestamp: '2m' },
    { id: 'a2', user: 'JaneDoe', action: 'įvertino', data: 'One Piece', type: 'review', timestamp: '1h' },
    { id: 'a3', user: 'OtakuKing', action: 'pridėjo', data: 'Spy x Family', type: 'list_update', timestamp: '5h' },
];

const WatchListStatuses = ['Watching', 'Completed', 'Plan to Watch', 'Dropped', 'On Hold'];

const StatBox: React.FC<{ label: string; value: string | number; icon?: React.ReactNode; color?: string }> = ({ label, value, icon, color = "text-white" }) => (
    <div className="flex flex-col p-4 bg-gray-800/40 rounded-sm border border-gray-800 hover:border-gray-700 transition group">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            {icon && <div className={`opacity-50 group-hover:opacity-100 transition ${color}`}>{icon}</div>}
        </div>
        <span className={`text-2xl font-mono font-light tracking-tight ${color}`}>{value}</span>
    </div>
);

const Badge: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded border border-gray-700/50 hover:border-gray-600 transition cursor-help" title="Badge Unlocked">
        <Trophy className="w-3 h-3 text-yellow-500/80" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-300">{name}</span>
    </div>
);

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    profile: UserProfile;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, username, profile }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const shareOptions = [
        {
            label: "Discord / Markdown",
            text: `**${username}** @ Otaku Gildija\nLevel ${profile.level} | ${profile.organizedFiles.toLocaleString()} Files\n[View Profile](https://otakunexus.lt/u/${username})`
        },
        {
            label: "Direct Link",
            text: `https://otakunexus.lt/u/${username}`
        }
    ];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f0e17] w-full max-w-md rounded-lg border border-gray-800 shadow-2xl relative">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Share Profile</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {shareOptions.map((option, idx) => (
                        <div key={idx} className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{option.label}</label>
                            <div className="flex items-center bg-gray-900 border border-gray-800 rounded px-3 py-2">
                                <span className="flex-grow text-xs text-gray-300 font-mono truncate mr-3">{option.text}</span>
                                <button 
                                    onClick={() => handleCopy(option.text, idx)}
                                    className="text-gray-500 hover:text-white transition"
                                >
                                    {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface CommunityHubProps {
    userId: string | null;
    onLaunchBlog: () => void;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ userId, onLaunchBlog }) => {
    const { status } = useMembership();
    const game = useGamificationOptional();
    const hasPass = status ? canAccessMemberLibrary(status) : false;
    const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Inventory' | 'Schedule' | 'Recruit'>('Overview');
    const [activeList, setActiveList] = useState(WatchListStatuses[0]);
    const [showShareModal, setShowShareModal] = useState(false);
    
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [quests, setQuests] = useState<Quest[]>(MOCK_QUESTS);
    const [miniPosts, setMiniPosts] = useState<MiniPost[]>([]);
    const [gazetteQuery, setGazetteQuery] = useState('');
    const [scoutComments, setScoutComments] = useState(0);
    const [isTransmuting, setIsTransmuting] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const username = getUsername(userId);
        const initialProfile = MOCK_USERS[username] || MOCK_USERS['Guest'];
        setUserProfile(initialProfile);
        
        // Fetch live quests instead of relying purely on mocks
        gamificationAPI.getQuests().then(res => {
            if (res.data && res.data.length > 0) {
                setQuests(res.data);
            }
        }).catch(err => console.warn('Using mock quests due to network error', err));

        getPublicMiniPosts().then(setMiniPosts).catch(() => setMiniPosts([]));
    }, [userId]);

    const getUsername = (uid: string | null) => {
        if (!uid) return 'Guest';
        if (uid.toLowerCase().includes('admin') || uid === 'USER_01') return 'DevAdmin';
        if (uid.toLowerCase().includes('king')) return 'OtakuKing';
        return 'Guest';
    };

    const username = getUsername(userId);

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsTransmuting(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    const newAvatar = await ProfileArtistAgent.transmuteAvatar(base64);
                    setUserProfile(prev => prev ? { ...prev, avatarUrl: newAvatar } : null);
                } catch (error) {
                    alert("Transmutation failed.");
                } finally {
                    setIsTransmuting(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarTransmuteClick = () => {
        document.getElementById('avatar-upload')?.click();
    };

    const handleClaimQuest = (questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (quest && quest.isCompleted && !quest.isClaimed && userProfile) {
            setUserProfile(prev => prev ? ({
                ...prev,
                coins: prev.coins + quest.rewardCoins,
                xp: prev.xp + quest.rewardXp
            }) : null);

            game?.addXp(quest.rewardXp, `Quest: ${quest.title}`, { eventType: 'QUEST_CLAIMED' });
            game?.addGold(quest.rewardCoins, `Quest: ${quest.title}`);

            setQuests(prev => prev.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
        }
    };

    const filteredMiniPosts = useGazetteSearch(miniPosts, gazetteQuery);

    const handleGachaPull = (cost: number): GachaItem | null => {
        if (userProfile && userProfile.coins >= cost) {
            const rand = Math.random();
            let pulledItem: GachaItem;
            if (rand > 0.99) pulledItem = MOCK_GACHA_ITEMS.find(i => i.rarity === 'Legendary') || MOCK_GACHA_ITEMS[0];
            else if (rand > 0.90) pulledItem = MOCK_GACHA_ITEMS.find(i => i.rarity === 'Epic') || MOCK_GACHA_ITEMS[0];
            else if (rand > 0.60) pulledItem = MOCK_GACHA_ITEMS.find(i => i.rarity === 'Rare') || MOCK_GACHA_ITEMS[0];
            else pulledItem = MOCK_GACHA_ITEMS.find(i => i.rarity === 'Common') || MOCK_GACHA_ITEMS[0];

            setUserProfile(prev => prev ? ({
                ...prev,
                coins: prev.coins - cost,
                inventory: [...prev.inventory, pulledItem.id],
                equippedChibi: pulledItem.type === 'Chibi' ? pulledItem.id : prev.equippedChibi
            }) : null);

            return pulledItem;
        }
        return null;
    };

    if (!userProfile) return null;

    const activeChibi = userProfile.equippedChibi 
        ? MOCK_GACHA_ITEMS.find(i => i.id === userProfile.equippedChibi) 
        : undefined;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header / Identity Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded bg-gray-800 border-2 border-gray-700 overflow-hidden relative">
                            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            {/* Transmute Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                <button 
                                    onClick={handleAvatarTransmuteClick}
                                    disabled={isTransmuting}
                                    className="p-2 bg-violet-600 rounded-full text-white hover:bg-violet-500 transition"
                                >
                                    {isTransmuting ? <Loader className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                </button>
                            </div>
                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
                        </div>
                        {/* Status Dot */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{username}</h1>
                             <span className="px-2 py-0.5 bg-violet-900/20 text-violet-300 text-[10px] font-bold uppercase rounded border border-violet-500/20">
                                {userProfile.level > 50 ? 'Elite' : 'Member'}
                             </span>
                        </div>
                        <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                            Level {userProfile.level} • Rank #{Math.floor(Math.random() * 5000)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-yellow-500 font-mono text-sm">
                                <Coins className="w-4 h-4 mr-2" />
                                {userProfile.coins.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center"
                    >
                        <Share2 className="w-4 h-4 mr-2" /> {t.community.share}
                    </button>
                    {activeChibi && (
                        <div className="hidden md:block scale-75 origin-bottom-right -mb-4">
                            <ChibiCompanion item={activeChibi} />
                        </div>
                    )}
                </div>
            </header>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-4">
                <StatBox 
                    label={t.community.stats_files}
                    value={userProfile.organizedFiles.toLocaleString()} 
                    icon={<FolderOpen className="w-4 h-4 text-violet-500" />} 
                />
                <StatBox 
                    label={t.community.stats_completed} 
                    value={userProfile.completedSeries} 
                    icon={<Check className="w-4 h-4 text-green-500" />} 
                />
                <StatBox 
                    label={t.community.stats_rate} 
                    value="94%" 
                    icon={<Activity className="w-4 h-4 text-pink-500" />} 
                    color="text-pink-400"
                />
                <StatBox 
                    label={t.community.stats_xp} 
                    value={userProfile.xp.toLocaleString()} 
                    icon={<Zap className="w-4 h-4 text-yellow-500" />} 
                    color="text-yellow-400"
                />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                {/* Left Column: Badges & Quests & Blog Updates */}
                <div className="space-y-6">
                    
                    {/* SYSTEM UPDATES WIDGET */}
                    <div className="bg-gradient-to-br from-violet-900/10 to-gray-900 border border-violet-500/20 rounded p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[size:20px_20px] bg-anime-grid opacity-10"></div>
                        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 flex items-center">
                            <Newspaper className="w-3 h-3 mr-2" /> System Updates
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <div className="border-l-2 border-pink-500 pl-3 py-1 cursor-pointer hover:bg-white/5 transition" onClick={onLaunchBlog}>
                                <div className="text-[10px] text-gray-500 font-mono mb-1">Today</div>
                                <div className="text-sm font-bold text-white group-hover:text-pink-400 transition">v2.4.1 Hotfix Released</div>
                            </div>
                            <div className="border-l-2 border-gray-700 pl-3 py-1 cursor-pointer hover:bg-white/5 transition" onClick={onLaunchBlog}>
                                <div className="text-[10px] text-gray-500 font-mono mb-1">Yesterday</div>
                                <div className="text-sm font-bold text-gray-300">Winter Event Schedule</div>
                            </div>
                        </div>
                        <button onClick={onLaunchBlog} className="mt-4 w-full py-2 bg-gray-800 hover:bg-violet-600 text-[10px] font-bold uppercase text-gray-400 hover:text-white rounded transition flex items-center justify-center">
                            Read Patch Notes <ArrowRight className="w-3 h-3 ml-2" />
                        </button>
                    </div>

                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Achievements</h3>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.badges.map(b => <Badge key={b} name={b} />)}
                            <button className="px-3 py-1.5 border border-dashed border-gray-700 text-gray-500 rounded text-[10px] uppercase font-bold hover:text-white transition">
                                View All
                            </button>
                        </div>
                    </section>

                    <section>
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t.community.tab_missions}</h3>
                         <div className="bg-gray-800/20 rounded border border-gray-800 p-4">
                            <QuestBoard quests={quests} onClaim={handleClaimQuest} />
                         </div>
                    </section>

                    <section>
                        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gazette scout</h3>
                            <input
                                type="search"
                                value={gazetteQuery}
                                onChange={(e) => setGazetteQuery(e.target.value)}
                                placeholder="Search posts…"
                                className="text-xs bg-gray-900 border border-gray-800 rounded px-2 py-1 text-gray-400 w-full sm:w-40"
                            />
                        </div>
                        <LibrarianScoutPanel
                            posts={filteredMiniPosts}
                            onScoutComplete={(n) => setScoutComments((c) => c + n)}
                        />
                        {scoutComments > 0 && (
                            <p className="text-[10px] text-[var(--anime-cyan,#92c7c7)] font-mono mt-2">
                                Kana added {scoutComments} librarian note{scoutComments === 1 ? '' : 's'} this session.
                            </p>
                        )}
                    </section>
                </div>

                {/* Right Column: Content Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Navigation */}
                    <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-hide">
                        {['Overview', 'History', 'Inventory', 'Schedule', 'Recruit'].map((tab) => (
                             <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                                    activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {tab === 'Schedule' ? <span className="flex items-center"><CalendarDays className="w-3 h-3 mr-1" /> Schedule</span> : 
                                 tab === 'Recruit' ? <span className="flex items-center"><UserPlus className="w-3 h-3 mr-1" /> Recruit</span> :
                                 tab === 'Overview' ? t.community.tab_overview : 
                                 tab === 'History' ? t.community.tab_history : 
                                 t.community.tab_inventory}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500"></div>}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'Schedule' && (
                        <GuildSchedule />
                    )}

                    {activeTab === 'Recruit' && (
                        <ReferralSystem />
                    )}

                    {activeTab === 'Overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             {/* Watchlist Filter */}
                             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                {WatchListStatuses.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveList(status)}
                                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap transition ${
                                            activeList === status 
                                                ? 'bg-gray-800 text-white border-gray-600' 
                                                : 'text-gray-500 border-transparent hover:text-gray-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                             </div>

                             {/* Table-like List */}
                             <div className="border border-gray-800 rounded bg-gray-900/30 overflow-hidden">
                                {MOCK_WATCHLIST.filter(i => i.status === activeList).map((item, idx) => (
                                    <div key={item.id} className={`p-4 flex items-center justify-between group hover:bg-gray-800/50 transition ${idx !== 0 ? 'border-t border-gray-800' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-gray-500 group-hover:text-violet-400 transition">
                                                <PlayCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-200 group-hover:text-white">{item.title}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                                    <span>Ep {Math.floor((item.progress / 100) * 24)}</span>
                                                    <span>•</span>
                                                    <span>{item.lastUpdate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            {item.rating && (
                                                <div className="flex items-center text-yellow-500/80 font-mono text-xs">
                                                    <Star className="w-3 h-3 mr-1 fill-current" /> {item.rating}
                                                </div>
                                            )}
                                            <div className="w-24 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.progress === 100 ? 'bg-green-500' : 'bg-violet-500'}`} style={{width: `${item.progress}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {MOCK_WATCHLIST.filter(i => i.status === activeList).length === 0 && (
                                    <div className="p-8 text-center text-gray-600 text-xs font-mono uppercase">
                                        No items found in {activeList}
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {activeTab === 'History' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             {MOCK_ACTIVITY_FEED.map(activity => (
                                <div key={activity.id} className="flex gap-4 p-4 border border-gray-800 rounded bg-gray-900/30 items-start">
                                    <div className="mt-1">
                                        {activity.type === 'achievement' ? <Trophy className="w-4 h-4 text-yellow-500" /> : 
                                         activity.type === 'review' ? <MessageSquare className="w-4 h-4 text-blue-500" /> : 
                                         <Activity className="w-4 h-4 text-pink-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="text-violet-400 font-bold">{activity.data}</span>
                                        </p>
                                        <span className="text-[10px] font-mono text-gray-600 uppercase mt-1 block">{activity.timestamp} ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Inventory' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {!hasPass && (
                              <div className="mb-4">
                                <LibraryPassCTA variant="inline" context="community" hasPass={hasPass} />
                              </div>
                            )}
                             <div className="bg-gray-800/20 border border-gray-800 rounded p-6">
                                <GachaSystem userCoins={userProfile.coins} onPull={handleGachaPull} />
                             </div>
                             
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-8 mb-4">Collection</h4>
                             <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {userProfile.inventory.map((itemId, idx) => {
                                    const item = MOCK_GACHA_ITEMS.find(i => i.id === itemId);
                                    return item ? (
                                        <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-800 hover:border-violet-500 transition cursor-pointer flex flex-col items-center justify-center group" title={item.name}>
                                            <div className="scale-75 mb-2 group-hover:scale-90 transition transform">
                                                <ChibiCompanion item={item} />
                                            </div>
                                            <span className="text-[9px] font-mono text-gray-500 uppercase truncate w-full text-center group-hover:text-white">{item.name}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <ShareModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                username={username}
                profile={userProfile}
            />
        </div>
    );
};

export default CommunityHub;
