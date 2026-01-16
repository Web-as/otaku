
import React, { useState, useMemo, useCallback } from 'react';
import { Search, List, Grid, Zap, BookOpen, Clock, AlertTriangle, ChevronDown, Laptop, Signal, Play, Star, Lock, Newspaper, ArrowUpRight, PlusCircle, Check, Calendar } from 'lucide-react';
import { MediaItem } from '../../types/types';
import LoadingSpinner from '../LoadingSpinner';
import { useJikan } from '../../services/jikan';
import { useAniList } from '../../services/anilist';
import { useLanguage } from '../../services/i18n';
import { updateWatchStatus } from '../../services/mockData';

const QualityOptions = ['All', '4K', '1080p', '720p', '480p'];
const TypeOptions = ['All', 'Series', 'Movie'];
const StatusOptions = ['Watching', 'Completed', 'Plan to Watch', 'Dropped', 'On Hold', 'Remove'];

interface FilterDropdownProps {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  label: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ options, selected, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full sm:w-auto font-mono">
            <button
                type="button"
                className="inline-flex justify-between sm:justify-center w-full rounded-sm border border-gray-700 shadow-sm px-4 py-2 bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-gray-700 focus:outline-none transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{label}: <span className="text-white ml-1">{selected}</span></span>
                <ChevronDown className="-mr-1 ml-2 h-4 w-4" />
            </button>
            {isOpen && (
                <div className="absolute right-0 left-0 sm:left-auto mt-2 w-full sm:w-40 rounded-sm shadow-xl bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu">
                        {options.map(option => (
                            <button
                                key={option}
                                onClick={() => { onSelect(option); setIsOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-xs uppercase font-bold tracking-wider ${selected === option ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface MediaItemCardProps {
    media: MediaItem;
    viewMode: 'grid' | 'list';
    onResume: (id: string) => void;
    onBlogClick: () => void;
}

const MediaItemCard: React.FC<MediaItemCardProps> = ({ media, viewMode, onResume, onBlogClick }) => {
    const isMissing = media.missing > 0;
    const progressColor = media.progress === 100 ? 'bg-green-500' : 'bg-pink-500';
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

    const handleStatusUpdate = (status: string) => {
        updateWatchStatus(media, status);
        setShowStatusMenu(false);
        setStatusFeedback(status);
        setTimeout(() => setStatusFeedback(null), 2000);
    };

    // Format airing time if available
    const getAiringText = () => {
        if (!media.nextAiringEpisode) return null;
        const days = Math.floor(media.nextAiringEpisode.timeUntilAiring / 86400);
        return `EP${media.nextAiringEpisode.episode} IN ${days}D`;
    };

    if (viewMode === 'grid') {
        return (
            <div className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-violet-500 transition duration-300 shadow-lg">
                <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                    {media.coverImage ? (
                        <img src={media.coverImage} alt={media.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition duration-500" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition duration-500 transform group-hover:scale-110">
                            <BookOpen className="w-16 h-16 text-white" />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90 z-10"></div>

                    {/* Top Right Badges */}
                    <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
                        <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-gray-300 border border-white/10 rounded-sm uppercase">
                            {media.resolution}
                        </span>
                        {isMissing && (
                            <span className="px-1.5 py-0.5 bg-red-600/90 text-[10px] font-mono font-bold text-white rounded-sm uppercase animate-pulse">
                                MISSING {media.missing}
                            </span>
                        )}
                        {/* New Score Badge */}
                        {media.averageScore && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/20 backdrop-blur text-[10px] font-mono font-bold text-yellow-400 border border-yellow-500/50 rounded-sm flex items-center">
                                <Star className="w-2 h-2 mr-1 fill-current" /> {media.averageScore}%
                            </span>
                        )}
                        {/* List Status Badge */}
                        {statusFeedback && (
                            <span className="px-1.5 py-0.5 bg-green-600 text-[10px] font-mono font-bold text-white rounded-sm uppercase animate-in fade-in slide-in-from-right-2">
                                <Check className="w-2 h-2 inline mr-1" /> {statusFeedback}
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
                         <div className={`${progressColor} h-full shadow-[0_0_10px_rgba(236,72,153,0.5)]`} style={{ width: `${media.progress}%` }}></div>
                    </div>

                    {/* Hover Controls */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 gap-2">
                        <button onClick={() => onResume(media.id)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 transition transform hover:scale-110">
                            <Play className="w-5 h-5 text-white fill-current ml-1" />
                        </button>
                        
                        <div className="flex gap-2">
                            <div className="relative">
                                <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="px-3 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-bold uppercase text-white hover:text-green-400 flex items-center border border-white/10 hover:border-green-500 transition">
                                    <PlusCircle className="w-3 h-3 mr-1" /> Add List
                                </button>
                                {showStatusMenu && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-900 border border-gray-700 rounded-sm shadow-xl z-50">
                                        {StatusOptions.map(status => (
                                            <button 
                                                key={status} 
                                                onClick={() => handleStatusUpdate(status)}
                                                className="block w-full text-left px-3 py-2 text-[10px] uppercase font-bold text-gray-300 hover:bg-violet-600 hover:text-white"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={onBlogClick} className="px-3 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-bold uppercase text-white hover:text-violet-400 flex items-center border border-white/10 hover:border-violet-500 transition">
                                <Newspaper className="w-3 h-3 mr-1" /> Review
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="p-3 relative z-20 bg-gray-900">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-pink-400 transition" title={media.title}>{media.title}</h3>
                    
                    {/* Studio & Year */}
                    {media.studios && media.studios.length > 0 && (
                        <div className="text-[9px] text-gray-500 font-mono mt-1 truncate">
                            {media.studios[0]} {media.seasonYear ? `• ${media.seasonYear}` : ''}
                        </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono uppercase">
                         <span className="flex items-center">
                            {media.type} 
                            <span className="mx-1">•</span> 
                            {media.episodes || '?'} EPS
                         </span>
                         {getAiringText() ? (
                             <span className="text-green-400 animate-pulse">{getAiringText()}</span>
                         ) : (
                             <span className={media.progress === 100 ? 'text-green-500' : 'text-pink-500'}>{media.progress}%</span>
                         )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center p-3 sm:p-4 bg-gray-900/50 rounded-sm border border-gray-800 hover:border-pink-500/50 hover:bg-gray-800 transition duration-200 group`}>
            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gray-800 rounded-sm flex-shrink-0 mr-3 sm:mr-4 flex items-center justify-center overflow-hidden relative">
                {media.coverImage ? (
                    <img src={media.coverImage} alt={media.title} className="w-full h-full object-cover" />
                ) : (
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-pink-400 transition" />
                )}
                {media.averageScore && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-bold px-1 font-mono">
                        {media.averageScore}
                    </div>
                )}
            </div>
            
            <div className="flex-grow min-w-0 pr-2 sm:pr-4">
                <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-pink-400 transition">{media.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-gray-800 text-[9px] sm:text-[10px] font-mono font-bold text-gray-400 border border-gray-700 rounded-sm uppercase">{media.resolution}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono uppercase">{media.type} • {media.episodes} Ep</span>
                    {media.studios?.[0] && (
                        <span className="text-[9px] sm:text-[10px] text-violet-400 font-mono uppercase hidden sm:inline">• {media.studios[0]}</span>
                    )}
                    {getAiringText() && (
                        <span className="text-[9px] sm:text-[10px] text-green-400 font-mono uppercase border border-green-900 bg-green-900/10 px-1 rounded animate-pulse">
                            {getAiringText()}
                        </span>
                    )}
                </div>
            </div>

            <div className="w-24 sm:w-32 hidden sm:block mr-6">
                <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                    <span>PROGRESS</span>
                    <span>{media.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`${progressColor} h-full`} style={{ width: `${media.progress}%` }}></div>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
                {isMissing && (
                    <div className="flex items-center text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider px-1.5 py-1 bg-red-900/10 border border-red-900/30 rounded-sm">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span className="hidden md:inline">{media.missing} MISSING</span>
                        <span className="md:hidden">!{media.missing}</span>
                    </div>
                )}
                
                <div className="relative">
                    <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition">
                        {statusFeedback ? <Check className="w-4 h-4 text-green-500" /> : <PlusCircle className="w-4 h-4" />}
                    </button>
                    {showStatusMenu && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-sm shadow-xl z-50">
                            {StatusOptions.map(status => (
                                <button 
                                    key={status} 
                                    onClick={() => handleStatusUpdate(status)}
                                    className="block w-full text-left px-3 py-2 text-[10px] uppercase font-bold text-gray-300 hover:bg-violet-600 hover:text-white"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => onResume(media.id)} 
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:bg-pink-600 hover:border-pink-500 transition"
                >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
            </div>
        </div>
    );
};

interface LibraryCatalogProps {
    userId: string | null;
    onLaunchBlog: () => void;
}

const LibraryCatalog: React.FC<LibraryCatalogProps> = ({ userId, onLaunchBlog }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuality, setSelectedQuality] = useState(QualityOptions[0]);
    const [selectedType, setSelectedType] = useState(TypeOptions[0]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLiveData, setIsLiveData] = useState(false);
    const [isSeasonalMode, setIsSeasonalMode] = useState(false);
    
    // Hooks for data
    const { mediaItems, loading: loadingJikan } = useJikan(searchTerm, isLiveData && !isSeasonalMode);
    
    // Use seasonal mode if toggle is on
    const { mediaItems: aniListItems, loading: loadingAniList } = useAniList(
        searchTerm, 
        isLiveData, 
        isSeasonalMode ? 'seasonal' : 'search'
    );
    
    const { t } = useLanguage();

    // Decide which data source to use
    const displayedItems = isLiveData ? aniListItems : mediaItems; // Prefer AniList for live, Jikan (or Mock) for local
    const loading = isLiveData ? loadingAniList : loadingJikan;

    const filteredMedia = useMemo(() => {
        let result = displayedItems;
        // Client side filtering for local mock data mainly
        if (!isLiveData) {
             if (selectedQuality !== 'All') result = result.filter(item => item.resolution === selectedQuality);
             if (selectedType !== 'All') result = result.filter(item => item.type === selectedType);
             if (searchTerm) {
                 const lowerSearch = searchTerm.toLowerCase();
                 result = result.filter(item => item.title.toLowerCase().includes(lowerSearch) || (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearch))));
             }
        }
        return result;
    }, [displayedItems, searchTerm, selectedQuality, selectedType, isLiveData]);

    const handleResume = useCallback((mediaId: string) => { console.log(`Resuming media item ID: ${mediaId}`); }, []);
    const missingEpisodesCount = useMemo(() => displayedItems.reduce((total, item) => total + (item.missing || 0), 0), [displayedItems]);

    return (
        <div className="max-w-7xl mx-auto min-h-screen">
            <header className="mb-6 md:mb-8 pb-4 border-b border-gray-800 flex flex-col md:flex-row md:items-end justify-between">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">{t.library.title}</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-gray-500 text-xs md:text-sm font-mono uppercase tracking-widest">{t.library.subtitle}</p>
                        <button onClick={onLaunchBlog} className="flex items-center text-[10px] font-bold uppercase text-violet-400 hover:text-white transition">
                            <Newspaper className="w-3 h-3 mr-1" />
                            Latest Patch Notes
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                     {/* Data Source Toggle */}
                    <div className="flex bg-gray-900 rounded-sm p-1 border border-gray-700">
                        <button 
                            onClick={() => { setIsLiveData(false); setIsSeasonalMode(false); }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-sm transition ${!isLiveData ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Local Drive
                        </button>
                        <button 
                            onClick={() => setIsLiveData(true)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-sm transition ${isLiveData ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Live API
                        </button>
                    </div>

                    <div className="flex bg-gray-900 rounded-sm p-1 border border-gray-700">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <Grid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-violet-500 transition" />
                    <input 
                        type="text" 
                        placeholder={t.library.search_placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isSeasonalMode}
                        className={`w-full bg-gray-900 border border-gray-700 text-white text-xs font-mono rounded-sm py-2.5 pl-10 pr-4 focus:border-violet-500 outline-none transition uppercase placeholder-gray-600 ${isSeasonalMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                
                {/* Seasonal Toggle (Only visible in Live Data mode) */}
                {isLiveData ? (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsSeasonalMode(!isSeasonalMode)}
                            className={`flex items-center px-4 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all ${
                                isSeasonalMode 
                                    ? 'bg-gradient-to-r from-pink-600 to-violet-600 text-white border-transparent shadow-lg' 
                                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-pink-500'
                            }`}
                        >
                            <Calendar className="w-3 h-3 mr-2" />
                            {new Date().getFullYear()} Season
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <FilterDropdown 
                            label={t.library.filter_quality}
                            options={QualityOptions} 
                            selected={selectedQuality} 
                            onSelect={setSelectedQuality} 
                        />
                        <FilterDropdown 
                            label={t.library.filter_type}
                            options={TypeOptions} 
                            selected={selectedType} 
                            onSelect={setSelectedType} 
                        />
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            {!isLiveData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900 border border-gray-800 p-3 rounded-sm flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{t.library.stat_items}</span>
                        <span className="text-white font-mono font-bold">{filteredMedia.length}</span>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-3 rounded-sm flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{t.library.stat_completed}</span>
                        <span className="text-green-400 font-mono font-bold">{filteredMedia.filter(i => i.progress === 100).length}</span>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-3 rounded-sm flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{t.library.stat_4k}</span>
                        <span className="text-pink-400 font-mono font-bold">{filteredMedia.filter(i => i.resolution === '4K' || i.resolution === '2160p').length}</span>
                    </div>
                     <div className="bg-gray-900 border border-gray-800 p-3 rounded-sm flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{t.library.stat_missing}</span>
                        <span className="text-red-400 font-mono font-bold">{missingEpisodesCount}</span>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner text={isLiveData ? "Fetching API Data..." : "Loading Database..."} />
                </div>
            ) : filteredMedia.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6" : "space-y-3"}>
                    {filteredMedia.map(item => (
                        <MediaItemCard 
                            key={item.id} 
                            media={item} 
                            viewMode={viewMode} 
                            onResume={handleResume}
                            onBlogClick={onLaunchBlog}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                        <Zap className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 uppercase">{t.library.empty}</h3>
                    <p className="text-gray-600 text-xs mt-2 font-mono">Try adjusting filters or sync settings.</p>
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedQuality('All'); setSelectedType('All'); setIsSeasonalMode(false); }}
                        className="mt-6 text-xs font-bold text-violet-500 uppercase hover:text-white transition"
                    >
                        {t.library.reset}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LibraryCatalog;
