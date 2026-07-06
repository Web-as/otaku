import React from 'react';
import { Cat, Ghost, Bot, Zap, Skull } from 'lucide-react';
import { GachaItem } from '../types/types';

interface ChibiCompanionProps {
    item?: GachaItem;
}

const ChibiCompanion: React.FC<ChibiCompanionProps> = ({ item }) => {
    if (!item) return null;

    const getIcon = () => {
        switch (item.icon) {
            case 'Cat': return <Cat className="w-16 h-16 text-pink-400" />;
            case 'Ghost': return <Ghost className="w-16 h-16 text-violet-400" />;
            case 'Bot': return <Bot className="w-16 h-16 text-blue-400" />;
            case 'Dragon': return <Skull className="w-16 h-16 text-yellow-500" />; // Fallback for dragon
            default: return <Zap className="w-16 h-16 text-yellow-400" />;
        }
    };

    return (
        <div className="relative group cursor-pointer">
            {/* Chibi Animation Container */}
            <div className="animate-bounce duration-[2000ms]">
                <div className="relative z-10 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {getIcon()}
                </div>
                
                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/40 rounded-full blur-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                {/* Mood Bubble (On Hover) */}
                <div className="absolute -top-8 -right-8 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-tl-xl rounded-tr-xl rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                    Nyan?
                </div>
            </div>

            {/* Aura Effect based on rarity */}
            {item.rarity === 'Legendary' && (
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse -z-10"></div>
            )}
        </div>
    );
};

export default ChibiCompanion;
