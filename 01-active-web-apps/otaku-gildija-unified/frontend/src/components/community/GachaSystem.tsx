import React, { useState } from 'react';
import { Package, Sparkles, AlertCircle } from 'lucide-react';
import { GachaItem, UserProfile } from '../../types/types';
import { MOCK_GACHA_ITEMS } from '../../services/mockData';

interface GachaSystemProps {
    userCoins: number;
    onPull: (cost: number) => GachaItem | null;
}

const GachaSystem: React.FC<GachaSystemProps> = ({ userCoins, onPull }) => {
    const PULL_COST = 100;
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastPull, setLastPull] = useState<GachaItem | null>(null);

    const handlePull = () => {
        if (userCoins < PULL_COST || isAnimating) return;

        setIsAnimating(true);
        setLastPull(null);

        // Simulation delay
        setTimeout(() => {
            const result = onPull(PULL_COST);
            setLastPull(result);
            setIsAnimating(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-8 text-center overflow-hidden group">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[size:40px_40px] bg-anime-grid opacity-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] group-hover:bg-pink-600/20 transition duration-1000"></div>

                <h3 className="relative z-10 text-2xl font-black text-white italic uppercase tracking-wider mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">Lobių Skrynia</span>
                </h3>
                <p className="relative z-10 text-gray-500 text-xs font-mono mb-8 uppercase">Gauk retus Chibi ir Temas</p>

                {/* Summoning Circle / Result */}
                <div className="relative z-10 h-48 flex items-center justify-center mb-8">
                    {isAnimating ? (
                        <div className="relative">
                             <div className="absolute inset-0 bg-white/20 blur-xl animate-ping rounded-full"></div>
                             <Package className="w-24 h-24 text-white animate-bounce" />
                        </div>
                    ) : lastPull ? (
                        <div className="animate-in zoom-in duration-300">
                             <div className={`w-32 h-32 rounded-lg border-2 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
                                 lastPull.rarity === 'Legendary' ? 'bg-yellow-500/20 border-yellow-500 shadow-yellow-500/50' :
                                 lastPull.rarity === 'Epic' ? 'bg-purple-500/20 border-purple-500 shadow-purple-500/50' :
                                 lastPull.rarity === 'Rare' ? 'bg-blue-500/20 border-blue-500 shadow-blue-500/50' :
                                 'bg-gray-500/20 border-gray-500'
                             }`}>
                                <Sparkles className="w-12 h-12 text-white" />
                             </div>
                             <p className={`text-lg font-bold uppercase ${
                                 lastPull.rarity === 'Legendary' ? 'text-yellow-400' :
                                 lastPull.rarity === 'Epic' ? 'text-purple-400' :
                                 lastPull.rarity === 'Rare' ? 'text-blue-400' :
                                 'text-gray-400'
                             }`}>
                                 {lastPull.name}
                             </p>
                             <span className="text-[10px] font-mono text-gray-500">{lastPull.rarity}</span>
                        </div>
                    ) : (
                        <div className="opacity-50 grayscale group-hover:grayscale-0 transition duration-500">
                            <Package className="w-24 h-24 text-gray-600 group-hover:text-pink-500 transition-colors" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                    <button 
                        onClick={handlePull}
                        disabled={userCoins < PULL_COST || isAnimating}
                        className={`px-8 py-3 rounded-sm font-black text-sm uppercase tracking-widest transition-all skew-x-[-10deg] ${
                            userCoins >= PULL_COST 
                                ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-900/50 hover:scale-105' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        }`}
                    >
                        <span className="skew-x-[10deg]">Atidaryti ({PULL_COST} Monetų)</span>
                    </button>
                    {userCoins < PULL_COST && (
                        <span className="text-[10px] text-red-400 font-mono flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Nepakanka lėšų
                        </span>
                    )}
                </div>
            </div>

            {/* Rates Table */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-gray-500 uppercase">
                <div className="p-2 bg-gray-800/50 rounded-sm">Common 60%</div>
                <div className="p-2 bg-blue-900/20 text-blue-400 rounded-sm">Rare 30%</div>
                <div className="p-2 bg-purple-900/20 text-purple-400 rounded-sm">Epic 9%</div>
                <div className="p-2 bg-yellow-900/20 text-yellow-400 rounded-sm">Legend 1%</div>
            </div>
        </div>
    );
};

export default GachaSystem;