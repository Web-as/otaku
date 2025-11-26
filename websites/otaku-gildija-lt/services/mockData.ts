
import { MediaItem, UserProfile, BlogPost, Quest, GachaItem } from '../types';

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
    { id: '1', title: 'Attack on Titan', resolution: '1080p', type: 'Series', progress: 80, episodes: 88, watched: 70, missing: 5, tags: ['Action', 'Fantasy', 'Shonen'] },
    { id: '2', title: 'Spirited Away', resolution: '4K', type: 'Movie', progress: 100, episodes: 1, watched: 1, missing: 0, tags: ['Fantasy', 'Ghibli', 'Family'] },
    { id: '3', title: 'Cyberpunk Edgerunners', resolution: '2160p', type: 'Series', progress: 0, episodes: 10, watched: 0, missing: 0, tags: ['Sci-Fi', 'Action', 'Cyberpunk'] },
    { id: '4', title: 'Chainsaw Man', resolution: '720p', type: 'Series', progress: 50, episodes: 12, watched: 6, missing: 6, tags: ['Horror', 'Action', 'Dark Fantasy'] },
    { id: '5', title: 'Neon Genesis Evangelion', resolution: '1080p', type: 'Series', progress: 100, episodes: 26, watched: 26, missing: 0, tags: ['Mecha', 'Psychological', 'Sci-Fi'] },
    { id: '6', title: 'Frieren: Beyond Journey\'s End', resolution: '1080p', type: 'Series', progress: 20, episodes: 28, watched: 5, missing: 0, tags: ['Fantasy', 'Adventure', 'Slice of Life'] },
];

export const MOCK_GACHA_ITEMS: GachaItem[] = [
    { id: 'chibi_neko', name: 'Neon Neko', type: 'Chibi', rarity: 'Common', description: 'Kibernetinis katinas, kuris mėgsta 4K failus.', icon: 'Cat' },
    { id: 'chibi_ghost', name: 'Cyber Spirit', type: 'Chibi', rarity: 'Rare', description: 'Dvasia iš seno serverio.', icon: 'Ghost' },
    { id: 'chibi_bot', name: 'Bot-Chan', type: 'Chibi', rarity: 'Common', description: 'Pagalbininkas rūšiavimui.', icon: 'Bot' },
    { id: 'chibi_dragon', name: 'Data Dragon', type: 'Chibi', rarity: 'Legendary', description: 'Legendinė būtybė, sauganti archyvus.', icon: 'Dragon' },
    { id: 'theme_matrix', name: 'Matrix Green', type: 'Theme', rarity: 'Epic', description: 'Klasikinis hakerio stilius.', icon: 'Zap' },
];

export const MOCK_QUESTS: Quest[] = [
    { id: 'q1', title: 'Binge Master', description: 'Peržiūrėk 3 epizodus iš eilės', type: 'Daily', rewardXp: 150, rewardCoins: 50, isCompleted: false, isClaimed: false, progress: 1, maxProgress: 3 },
    { id: 'q2', title: 'Bibliotekininkas', description: 'Surūšiuok 10 naujų failų', type: 'Daily', rewardXp: 100, rewardCoins: 30, isCompleted: true, isClaimed: false, progress: 10, maxProgress: 10 },
    { id: 'q3', title: 'Kritikas', description: 'Parašyk vieną anime apžvalgą', type: 'Weekly', rewardXp: 500, rewardCoins: 200, isCompleted: false, isClaimed: false, progress: 0, maxProgress: 1 },
];

export const MOCK_USERS: Record<string, UserProfile> = {
    'DevAdmin': {
        id: 'user_admin_01',
        username: 'DevAdmin',
        email: 'admin@otakunexus.lt',
        level: 99,
        xp: 999999,
        nextLevelXp: 1000000,
        organizedFiles: 142050,
        completedSeries: 850,
        badges: ['System Architect', 'God Mode', 'Day One'],
        avatarUrl: "https://ui-avatars.com/api/?name=Dev+Admin&background=7c3aed&color=fff",
        coins: 5000,
        equippedChibi: 'chibi_dragon',
        inventory: ['chibi_dragon', 'chibi_neko', 'theme_matrix'],
        preferences: { theme: 'dark', notifications: true },
        createdAt: '2023-01-01T00:00:00Z'
    },
    'OtakuKing': {
        id: 'user_king_01',
        username: 'OtakuKing',
        email: 'king@otakunexus.lt',
        level: 42,
        xp: 45200,
        nextLevelXp: 50000,
        organizedFiles: 12400,
        completedSeries: 340,
        badges: ['Data Hoarder', 'Critic', 'Completionist'],
        avatarUrl: "https://ui-avatars.com/api/?name=Otaku+King&background=db2777&color=fff",
        coins: 1250,
        equippedChibi: 'chibi_ghost',
        inventory: ['chibi_ghost', 'chibi_neko'],
        preferences: { theme: 'dark', notifications: true },
        createdAt: '2023-05-20T00:00:00Z'
    },
    'Guest': {
        id: 'user_guest_01',
        username: 'Guest',
        email: 'guest@otakunexus.lt',
        level: 5,
        xp: 1200,
        nextLevelXp: 2500,
        organizedFiles: 150,
        completedSeries: 3,
        badges: ['Newcomer'],
        avatarUrl: "https://ui-avatars.com/api/?name=Guest+User&background=374151&color=fff",
        coins: 100,
        inventory: [],
        preferences: { theme: 'dark', notifications: false },
        createdAt: new Date().toISOString()
    }
};

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { 
        id: 'b1', 
        title: 'System Update v2.4.0', 
        author: 'System', 
        date: '2024-11-20', 
        excerpt: 'Major overhaul to the hashing algorithm and added 4K support. The sync engine is now 40% faster.',
        category: 'Update',
        readTime: '2 min',
        type: 'official'
    },
    { 
        id: 'b2', 
        title: 'Community Event: Winter Watch', 
        author: 'Admin', 
        date: '2024-11-15', 
        excerpt: 'Join us for the annual winter anime marathon. Voting for titles begins next week.',
        category: 'Announcement',
        readTime: '3 min',
        type: 'official'
    }
];

let blogPosts = [...MOCK_BLOG_POSTS];

export const getBlogPosts = (): BlogPost[] => {
    return blogPosts;
};

export const addBlogPost = (post: Omit<BlogPost, 'id'>): void => {
    const newPost: BlogPost = {
        id: Date.now().toString(),
        ...post
    };
    blogPosts = [newPost, ...blogPosts];
};