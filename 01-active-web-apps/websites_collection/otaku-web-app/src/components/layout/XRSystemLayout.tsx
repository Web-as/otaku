'use client';

import React from 'react';
import GuildRoom3D from '../ui/GuildRoom3D';
import { guildXRStore } from '@/lib/webxr/xrStore';
import { useWebXRAvailability } from '@/lib/webxr/useWebXRAvailability';

interface XRSystemLayoutProps {
  children: React.ReactNode;
}

/**
 * XRSystemLayout wraps standard (non-VN) pages in a spatial computing shell.
 * 
 * - The existing GuildRoom3D Three.js canvas renders the 3D background
 *   (SpatialUI, LibraryShelves3D, TeleportationMesh) using the shared guildXRStore.
 * - Page content is overlaid in a glassmorphic panel above the 3D scene.
 * - "Enter VR / AR" buttons use the shared XR store so everything stays in sync.
 */
export function XRSystemLayout({ children }: XRSystemLayoutProps) {
  const availability = useWebXRAvailability();

  return (
    <div className="relative w-full min-h-screen bg-[#0f0e17] text-white overflow-hidden">
      
      {/* 3D Scene — reuses the shared guildXRStore so VR/AR sessions are consistent */}
      <GuildRoom3D />

      {/* XR Entry Buttons (visible on supported devices) */}
      {availability.checked && availability.immersive && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {availability.supportsVR && (
            <button 
              onClick={() => void guildXRStore.enterVR()}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border border-violet-500/40 bg-violet-950/60 text-violet-300 hover:bg-violet-500/30 backdrop-blur-sm transition-colors shadow-[0_0_12px_rgba(139,92,246,0.2)]"
            >
              Enter VR
            </button>
          )}
          {availability.supportsAR && (
            <button 
              onClick={() => void guildXRStore.enterAR()}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-500/30 backdrop-blur-sm transition-colors shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              Enter AR
            </button>
          )}
        </div>
      )}

      {/* 2D HTML Overlay — glassmorphic panel floating above the 3D canvas */}
      <div className="relative z-10 min-h-screen flex justify-center pt-6 pb-8 px-4">
        <div className="w-full max-w-7xl">
          <div className="bg-[#0f0e17]/70 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
