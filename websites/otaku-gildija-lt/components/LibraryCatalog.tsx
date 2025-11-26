
import React, { useState, useMemo, useCallback } from 'react';
import { Search, List, Grid, Zap, BookOpen, Clock, AlertTriangle, ChevronDown, Laptop, Signal, Play, Star, MoreVertical, Lock } from 'lucide-react';
import { MediaItem } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { MOCK_MEDIA_ITEMS } from '../services/mockData';

const QualityOptions = ['All', '4K', '1080p', '720p', '480p'];
const TypeOptions = ['All', 'Series', 'Movie'];

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
}

const MediaItemCard: React.FC<MediaItemCardProps> = ({ media, viewMode, onResume }) => {
    const isMissing = media.missing > 0;
    const progressColor = media.progress === 100 ? 'bg-green-500' : 'bg-pink-500';

    if (viewMode === 'grid') {
        return (
            <div className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-violet-500 transition duration-300 shadow-lg">
                {/* Poster Simulation */}
                <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90 z-10"></div>
                    
                    {/* Placeholder Art */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition duration-500 transform group-hover:scale-110">
                        <BookOpen className="w-16 h-16 text-white" />
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
                        <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-gray-300 border border-white/10 rounded-sm uppercase">
                            {media.resolution}
                        </span>
                        {isMissing && (
                            <span className="px-1.5 py-0.5 bg-red-600/90 text-[10px] font-mono font-bold text-white rounded-sm uppercase animate-pulse">
                                MISSING {media.missing}
                            </span>
                        )}
                    </div>

                    {/* Progress Bar (Bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
                         <div className={`${progressColor} h-full shadow-[0_0_10px_rgba(236,72,153,0.5)]`} style={{ width: `${media.progress}%` }}></div>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <button onClick={() => onResume(media.id)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 transition transform hover:scale-110">
                            <Play className="w-5 h-5 text-white fill-current ml-1" />
                        </button>
                    </div>
                </div>
                
                <div className="p-3 relative z-20 bg-gray-900">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-pink-400 transition" title={media.title}>{media.title}</h3>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 font-mono uppercase">
                         <span>{media.type} • {media.episodes} EPS</span>
                         <span className={media.progress === 100 ? 'text-green-500' : 'text-pink-500'}>{media.progress}%</span>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className={`flex items-center p-3 sm:p-4 bg-gray-900/50 rounded-sm border border-gray-800 hover:border-pink-500/50 hover:bg-gray-800 transition duration-200 group`}>
            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gray-800 rounded-sm flex-shrink-0 mr-3 sm:mr-4 flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-pink-400 transition" />
            </div>
            
            <div className="flex-grow min-w-0 pr-2 sm:pr-4">
                <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-pink-400 transition">{media.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-gray-800 text-[9px] sm:text-[10px] font-mono font-bold text-gray-400 border border-gray-700 rounded-sm uppercase">{media.resolution}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono uppercase">{media.type} • {media.episodes} Ep</span>
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
}

const LibraryCatalog: React.FC<LibraryCatalogProps> = ({ userId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuality, setSelectedQuality] = useState(QualityOptions[0]);
    const [selectedType, setSelectedType] = useState(TypeOptions[0]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Simulating loading state
    const [loading] = useState(false);
    const mediaItems = MOCK_MEDIA_ITEMS;

    const filteredMedia = useMemo(() => {
        let result = mediaItems;

        if (selectedQuality !== 'All') {
            result = result.filter(item => item.resolution === selectedQuality);
        }

        if (selectedType !== 'All') {
            result = result.filter(item => item.type === selectedType);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.title.toLowerCase().includes(lowerSearch) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
            );
        }

        return result;
    }, [mediaItems, searchTerm, selectedQuality, selectedType]);

    const handleResume = useCallback((mediaId: string) => {
        console.log(`Resuming media item ID: ${mediaId}`);
    }, []);

    const missingEpisodesCount = useMemo(() => 
        mediaItems.reduce((total, item) => total + (item.missing || 0), 0), 
        [mediaItems]
    );

    return (
        <div className="max-w-7xl mx-auto min-h-screen">
            <header className="mb-6 md:mb-8 pb-4 border-b border-gray-800 flex flex-col md:flex-row md:items-end justify-between">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">Gildijos</span> Archyvas
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm font-mono mt-1 uppercase tracking-widest">Duombazės Būsena: Aktyvi</p>
                </div>
                
                {/* Sync Indicator */}
                <div className="flex items-center space-x-3 bg-gray-900/80 backdrop-blur px-4 py-2 rounded-sm border border-gray-700 w-fit">
                    <div className="relative">
                        <Laptop className="w-4 h-4 text-gray-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ryšio Statusas</span>
                        <span className="text-xs font-bold text-green-400 font-mono">AUTOSORTER ONLINE</span>
                    </div>
                    <Signal className="w-4 h-4 text-green-500 ml-2" />
                </div>
            </header>

            {/* Stats Cards - HUD Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-10">
                <div className="bg-gray-900 border border-gray-800 p-3 md:p-4 rounded-sm relative overflow-hidden group hover:border-violet-500 transition duration-300">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-violet-500/10 rounded-bl-full -mr-8 -mt-8 transition group-hover:bg-violet-500/20"></div>
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-violet-500 mb-2" />
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Viso Įrašų</p>
                    <p className="text-xl md:text-2xl font-black text-white">{mediaItems.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-3 md:p-4 rounded-sm relative overflow-hidden group hover:border-green-500 transition duration-300">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-8 -mt-8 transition group-hover:bg-green-500/20"></div>
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-green-500 mb-2" />
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Užbaigta</p>
                    <p className="text-xl md:text-2xl font-black text-white">{mediaItems.filter(i => i.progress === 100).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-3 md:p-4 rounded-sm relative overflow-hidden group hover:border-yellow-500 transition duration-300">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full -mr-8 -mt-8 transition group-hover:bg-yellow-500/20"></div>
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mb-2" />
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">4K Turinis</p>
                    <p className="text-xl md:text-2xl font-black text-white">{mediaItems.filter(i => i.resolution === '4K' || i.resolution === '2160p').length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-3 md:p-4 rounded-sm relative overflow-hidden group hover:border-red-500 transition duration-300">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-8 -mt-8 transition group-hover:bg-red-500/20"></div>
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-500 mb-2" />
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Trūksta Ep</p>
                    <p className="text-xl md:text-2xl font-black text-white">{missingEpisodesCount}</p>
                </div>
            </div>

            {/* UPSELL BANNER (If using advanced filters) */}
            {selectedQuality === '4K' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-violet-900/40 to-pink-900/40 border border-pink-500/30 rounded-sm flex items-center justify-between animate-in fade-in duration-300">
                    <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-pink-500" />
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase italic">Premium Feature Active</h4>
                            <p className="text-xs text-gray-400">4K/HDR Analysis requires the <strong>Autosorter Core</strong> license.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase rounded-sm shadow-lg shadow-pink-900/30">
                        Unlock Core
                    </button>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 p-2 md:p-1 bg-gray-900 border border-gray-800 rounded-sm">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="IEŠKOTI ARCHYVE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pl-10 pr-4 bg-transparent text-white focus:outline-none placeholder-gray-600 font-mono text-sm uppercase"
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 px-0 sm:px-4 lg:border-l border-gray-800">
                    <FilterDropdown options={QualityOptions} selected={selectedQuality} onSelect={setSelectedQuality} label="Kokybė" />
                    <FilterDropdown options={TypeOptions} selected={selectedType} onSelect={setSelectedType} label="Tipas" />
                </div>

                <div className="flex items-center justify-center gap-1 sm:pr-1 sm:pl-4 lg:border-l border-gray-800 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`flex-1 sm:flex-none p-2 rounded-sm transition flex justify-center ${viewMode === 'grid' ? 'bg-gray-800 text-pink-500' : 'text-gray-600 hover:text-white'}`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`flex-1 sm:flex-none p-2 rounded-sm transition flex justify-center ${viewMode === 'list' ? 'bg-gray-800 text-pink-500' : 'text-gray-600 hover:text-white'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? <LoadingSpinner text="SINCING LIBRARY..." /> : (
                <>
                    {filteredMedia.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/50 rounded border border-dashed border-gray-800">
                            <p className="text-gray-500 font-mono text-sm uppercase">Nerasta duomenų šiame sektoriuje.</p>
                            <button onClick={() => { setSearchTerm(''); setSelectedQuality('All'); setSelectedType('All'); }} className="mt-4 text-pink-500 hover:text-pink-400 font-bold uppercase text-xs tracking-wider">Atstatyti Parametrus</button>
                        </div>
                    ) : (
                        <div className={`
                            ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6' : 'flex flex-col gap-2'}
                        `}>
                            {filteredMedia.map(media => (
                                <MediaItemCard key={media.id} media={media} viewMode={viewMode} onResume={handleResume} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LibraryCatalog;
