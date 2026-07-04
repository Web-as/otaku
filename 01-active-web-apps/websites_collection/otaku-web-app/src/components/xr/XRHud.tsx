import React from 'react';
import { useSyncStore } from '@/lib/webxr/syncStore';
import { guildXRStore } from '@/lib/webxr/xrStore';
import { LogOut, Layout } from 'lucide-react';

export function XRHud() {
  const isXRMode = useSyncStore((state) => state.isXRMode);
  
  // This is rendered inside a regular React DOM node.
  // It will be overlayed on top of the WebXR session if the device supports DOM overlays.
  
  if (!isXRMode) return null;

  return (
    <div className="xr-dom-overlay pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="glass-panel p-3 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-cyan-neon flex items-center justify-center text-black font-bold">
            XR
          </div>
          <div>
            <h1 className="text-white font-bold text-sm m-0">Aetherpunk Guild</h1>
            <p className="text-cyan-300 text-[10px] uppercase tracking-wider m-0">Immersive Mode Active</p>
          </div>
        </div>
        
        <button 
          onClick={() => guildXRStore.getState().session?.end()}
          className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 p-2 rounded-lg backdrop-blur transition-colors"
          title="Exit XR"
        >
          <LogOut size={20} />
        </button>
      </div>
      
      {/* Bottom Bar Controls */}
      <div className="flex justify-center pb-4 pointer-events-auto">
        <div className="glass-panel px-4 py-2 rounded-full flex gap-4">
          <button className="text-gray-300 hover:text-white transition-colors flex flex-col items-center gap-1">
            <Layout size={18} />
            <span className="text-[9px] uppercase">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default XRHud;
