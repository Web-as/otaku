'use client';

import { Glasses, Smartphone } from 'lucide-react';
import { guildXRStore } from '@/lib/webxr/xrStore';
import { useWebXRAvailability } from '@/lib/webxr/useWebXRAvailability';

interface WebXRControlsProps {
  compact?: boolean;
}

export function WebXRControls({ compact = false }: WebXRControlsProps) {
  const availability = useWebXRAvailability();

  if (!availability.checked || !availability.immersive) {
    return null;
  }

  const enterVR = async () => {
    try {
      await guildXRStore.enterVR();
    } catch (error) {
      console.error('WebXR VR session failed:', error);
    }
  };

  const enterAR = async () => {
    try {
      await guildXRStore.enterAR();
    } catch (error) {
      console.error('WebXR AR session failed:', error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1" role="group" aria-label="Immersive modes">
        {availability.supportsVR && (
          <button
            type="button"
            onClick={() => void enterVR()}
            className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border border-violet-500/40 text-violet-300 hover:bg-violet-500/20 transition-colors"
            title="Enter VR (WebXR)"
          >
            VR
          </button>
        )}
        {availability.supportsAR && (
          <button
            type="button"
            onClick={() => void enterAR()}
            className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            title="Enter AR (WebXR)"
          >
            AR
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-violet-500/25 bg-violet-950/30"
      role="group"
      aria-label="Immersive modes"
    >
      <span className="text-xs text-gray-400 uppercase tracking-wider w-full sm:w-auto">Immersive</span>
      {availability.supportsVR && (
        <button
          type="button"
          onClick={() => void enterVR()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-violet-600/80 hover:bg-violet-500 transition-colors"
        >
          <Glasses className="w-4 h-4" />
          Enter VR
        </button>
      )}
      {availability.supportsAR && (
        <button
          type="button"
          onClick={() => void enterAR()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-cyan-600/80 hover:bg-cyan-500 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          Enter AR
        </button>
      )}
    </div>
  );
}

export default WebXRControls;
