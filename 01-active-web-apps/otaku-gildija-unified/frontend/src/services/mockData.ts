
import { MediaItem, UserProfile, BlogPost, Quest, GachaItem, WatchListItem, ShopProduct } from '../types/types';

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
        id: 'dev_01',
        title: 'File Organizer 2.0: Architecture Overhaul',
        author: 'Lead Architect',
        date: '2024-12-03',
        excerpt: 'Complete restructuring with modular architecture. Features transactional undo system, unified launcher, and 100% test coverage.',
        category: 'Engineering',
        readTime: '6 min',
        type: 'official',
        image: 'https://placehold.co/600x400/1a1a2e/60a5fa?text=Architecture+v2',
        tags: ['Refactor', 'Python', 'Performance']
    },
    {
        id: 'dev_02',
        title: 'Anime Library API: Production Ready',
        author: 'Backend Team',
        date: '2024-11-30',
        excerpt: 'FastAPI implementation complete with 52+ endpoints. Now supporting real-time WebSockets, batch operations, and smart file management.',
        category: 'Backend',
        readTime: '5 min',
        type: 'official',
        image: 'https://placehold.co/600x400/1a1a2e/a78bfa?text=API+Release',
        tags: ['FastAPI', 'WebSocket', 'Database']
    },
    {
        id: 'dev_03',
        title: 'AI & Metadata Integration',
        author: 'AI Research',
        date: '2024-11-28',
        excerpt: 'Gemini 2.0 integration for anime-style image generation. Automated genre seeding and intelligent metadata extraction pipeline active.',
        category: 'AI / ML',
        readTime: '4 min',
        type: 'official',
        image: 'https://placehold.co/600x400/1a1a2e/f472b6?text=AI+Integration',
        tags: ['Gemini', 'GenAI', 'Metadata']
    },
    { 
        id: 'b1', 
        title: 'System Update v2.4.0: 4K Hashing', 
        author: 'System', 
        date: '2024-11-20', 
        excerpt: 'Major overhaul to the hashing algorithm and added 4K support. The sync engine is now 40% faster.',
        category: 'Engineering',
        readTime: '2 min',
        type: 'official',
        image: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=System+Update',
        tags: ['Patch Notes', 'Backend', 'Performance']
    },
    { 
        id: 'b2', 
        title: 'Winter Season 2025: The Ultimate Guide', 
        author: 'OtakuKing', 
        date: '2024-11-15', 
        excerpt: 'From returning giants to hidden gems, here is everything you need to add to your Autosorter download queue this winter.',
        category: 'Guide',
        readTime: '8 min',
        type: 'community',
        image: 'https://placehold.co/600x400/1a1a2e/ec4899?text=Winter+Guide',
        tags: ['Season Guide', 'Recommendations', 'Hype']
    },
    {
        id: 'b3',
        title: 'Review: "Frieren" is a Masterpiece',
        author: 'K4T0',
        date: '2024-11-10',
        excerpt: 'A slow-burn journey that redefines fantasy anime. Why every archive needs this series in 1080p FLAC.',
        category: 'Review',
        readTime: '5 min',
        type: 'review',
        rating: 9.8,
        image: 'https://placehold.co/600x400/1a1a2e/22c55e?text=Frieren+Review',
        tags: ['Fantasy', 'Review', 'Masterpiece']
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

// --- WATCH LIST / LIBRARY MOCK DATA ---

// Enhanced WatchList Item to include rich data for the profile view
export interface ExtendedWatchListItem extends WatchListItem {
    image?: string;
    episodes?: number;
}

export let MOCK_WATCHLIST: ExtendedWatchListItem[] = [
    { id: 'l1', title: 'Jujutsu Kaisen', status: 'Watching', progress: 75, rating: 9, lastUpdate: '2025-11-20', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEfseh.jpg', episodes: 24 },
    { id: 'l2', title: 'Death Note', status: 'Completed', progress: 100, rating: 10, lastUpdate: '2024-05-15', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawCwhwk98z2.jpg', episodes: 37 },
    { id: 'l3', title: 'Mushoku Tensei', status: 'Plan to Watch', progress: 0, rating: undefined, lastUpdate: '2025-11-25', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-B9SqaHuDj32R.jpg', episodes: 23 },
];

export const getWatchList = (): ExtendedWatchListItem[] => {
    return MOCK_WATCHLIST;
};

export const updateWatchStatus = (item: MediaItem, status: string) => {
    const existingIndex = MOCK_WATCHLIST.findIndex(w => w.title === item.title); // Use title for loose matching between API and Mock
    
    if (status === 'Remove') {
        if (existingIndex !== -1) {
            MOCK_WATCHLIST.splice(existingIndex, 1);
        }
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (existingIndex !== -1) {
        // Update existing
        MOCK_WATCHLIST[existingIndex] = {
            ...MOCK_WATCHLIST[existingIndex],
            status: status,
            lastUpdate: today,
            // Update metadata if it was missing
            image: item.coverImage || MOCK_WATCHLIST[existingIndex].image,
            episodes: item.episodes || MOCK_WATCHLIST[existingIndex].episodes
        };
    } else {
        // Add new
        const newItem: ExtendedWatchListItem = {
            id: item.id,
            title: item.title,
            status: status,
            progress: item.progress || 0,
            rating: undefined,
            lastUpdate: today,
            image: item.coverImage,
            episodes: item.episodes
        };
        MOCK_WATCHLIST.push(newItem);
    }
};

export const MOCK_MERCH_PRODUCTS: ShopProduct[] = [
    { id: 'p1', title: 'Guild Hoodie - Black/Violet', price: 49.99, image: 'https://placehold.co/400x400/1a1a2e/7c3aed?text=Hoodie', category: 'Apparel' },
    { id: 'p2', title: 'NEXUS-7 Figure (1/7 Scale)', price: 129.99, image: 'https://placehold.co/400x400/1a1a2e/ec4899?text=Figure', category: 'Figure' },
    { id: 'p3', title: 'Autosorter Core - Keycap', price: 14.99, image: 'https://placehold.co/400x400/1a1a2e/22c55e?text=Keycap', category: 'Accessory' },
];
