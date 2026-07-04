import React, { useState } from 'react';
import { Box, Sparkles, RefreshCw, Hexagon, Layers, Crosshair } from 'lucide-react';

export interface XRItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  model_glb_url?: string;
  model_usdz_url?: string;
  image_url?: string;
  asset_type: '2D' | '3D_XR';
}

interface Props {
  items: XRItem[];
  loading?: boolean;
  onSendToXR?: (item: XRItem) => void;
}

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-400 border-gray-500 shadow-gray-500/20',
  uncommon: 'from-green-500 to-emerald-400 border-emerald-500 shadow-emerald-500/30',
  rare: 'from-blue-500 to-cyan-400 border-cyan-500 shadow-cyan-500/40',
  epic: 'from-purple-600 to-pink-500 border-pink-500 shadow-pink-500/50',
  legendary: 'from-amber-500 to-yellow-300 border-yellow-400 shadow-yellow-500/60',
};

export default function NeonCubeInventory({ items, loading = false, onSendToXR }: Props) {
  const [selectedItem, setSelectedItem] = useState<XRItem | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#0a0a0f] rounded-2xl border border-gray-800">
        <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#050508] rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 flex items-center gap-3 tracking-widest uppercase">
            <Hexagon className="w-8 h-8 text-cyan-400" />
            Neural Stash
          </h2>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-mono">
            {items.length} Artifacts Secured
          </p>
        </div>
        <div className="px-4 py-2 bg-gray-900/50 rounded border border-gray-700/50 flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Live Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item === selectedItem ? null : item)}
            className={`
              relative group cursor-pointer aspect-square rounded-xl p-1 transition-all duration-300
              ${selectedItem?.id === item.id ? 'scale-105 z-20' : 'hover:scale-105 hover:z-10'}
            `}
          >
            {/* The Neon Cube Border */}
            <div className={`
              absolute inset-0 rounded-xl border-2 transition-all duration-300
              bg-gradient-to-br ${RARITY_COLORS[item.rarity]} 
              ${selectedItem?.id === item.id ? 'opacity-100 shadow-[0_0_30px_rgba(0,0,0,0)]' : 'opacity-20 group-hover:opacity-100'}
            `}></div>
            
            {/* The Glass Interior */}
            <div className="absolute inset-1 bg-[#0f0e17]/90 backdrop-blur-xl rounded-lg flex flex-col items-center justify-center overflow-hidden border border-white/5">
              
              {/* Quantity Badge */}
              {item.quantity > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-mono font-bold text-white border border-white/10">
                  x{item.quantity}
                </div>
              )}

              {/* Asset Icon / Fallback */}
              <div className="w-16 h-16 mb-2 flex items-center justify-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${RARITY_COLORS[item.rarity]} opacity-20 blur-xl rounded-full`}></div>
                {item.asset_type === '3D_XR' ? (
                  <Box className={`w-10 h-10 drop-shadow-2xl ${RARITY_COLORS[item.rarity].split(' ')[0].replace('from-', 'text-')}`} />
                ) : item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain" />
                ) : (
                  <Sparkles className="w-8 h-8 text-gray-500" />
                )}
              </div>

              {/* Item Name */}
              <h3 className="text-xs font-black uppercase text-center px-2 text-white truncate w-full tracking-wider">
                {item.name}
              </h3>
              
              {/* XR Tag */}
              {item.asset_type === '3D_XR' && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl">
            <Crosshair className="w-12 h-12 text-gray-600 mb-3" />
            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Stash Empty</span>
          </div>
        )}
      </div>

      {/* Expanded Detail Panel */}
      {selectedItem && (
        <div className="mt-8 p-6 bg-gradient-to-r from-[#151423] to-[#0f0e17] rounded-2xl border border-gray-700/50 animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 shadow-2xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded bg-gradient-to-r ${RARITY_COLORS[selectedItem.rarity]} text-black`}>
                {selectedItem.rarity}
              </span>
              {selectedItem.asset_type === '3D_XR' && (
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded border border-cyan-500 text-cyan-400 bg-cyan-500/10">
                  XR Ready
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">{selectedItem.name}</h3>
            <p className="text-gray-400 text-sm max-w-2xl">{selectedItem.description}</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col gap-3">
            {selectedItem.asset_type === '3D_XR' && (
              <button
                onClick={() => onSendToXR?.(selectedItem)}
                className="w-full md:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:scale-105 flex items-center justify-center gap-2"
              >
                <Box className="w-4 h-4" /> Beam to Glasses
              </button>
            )}
            <button className="w-full md:w-auto px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase tracking-widest rounded transition flex items-center justify-center">
              Inspect Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
