'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { guildXRStore } from '@/lib/webxr/xrStore';
import { useSyncStore } from '@/lib/webxr/syncStore';
import { detectGPUTier, getXRRenderingConfig, GPUTier } from '@/lib/webxr/xrPerformance';

// import GuildHall3D from './GuildHall3D';
import FlatScreenFallback from './FlatScreenFallback';
import SpatialUI from '../webxr/SpatialUI';
import LibraryShelves3D from '../webxr/LibraryShelves3D';
import QuestBoard3D from './QuestBoard3D';
import CommunityPlaza3D from './CommunityPlaza3D';
import GachaSummon3D from './GachaSummon3D';
import VNTheater3D from './VNTheater3D';
import Live2DCompanion3D from './Live2DCompanion3D';
import TeleportationMesh from '../webxr/TeleportationMesh';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// Wrapper component to get gl context inside Canvas
function SceneContents({ gpuTier, isXRActive }: { gpuTier: GPUTier, isXRActive: boolean }) {
  const config = getXRRenderingConfig(gpuTier, isXRActive);
  
  return (
    <>
      <FlatScreenFallback />
      {/* <GuildHall3D /> */}
      <SpatialUI />
      
      {/* Dynamic Feature Zones */}
      <LibraryShelves3D />
      <QuestBoard3D />
      <CommunityPlaza3D />
      <GachaSummon3D />
      <VNTheater3D />
      <Live2DCompanion3D />
      
      {isXRActive && <TeleportationMesh />}

      {/* Post Processing (only if high tier and not in XR for performance reasons, or configured via tier) */}
      {config.postProcessing && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}
    </>
  );
}

export function XRScene() {
  const [gpuTier, setGpuTier] = useState<GPUTier>('mid');
  const isXRMode = useSyncStore((state) => state.isXRMode);
  const setXRMode = useSyncStore((state) => state.setXRMode);

  useEffect(() => {
    // Listen for XR session start/end to update state
    const unsubStart = guildXRStore.subscribe((state, prevState) => {
      if (state.session && !prevState.session) {
        setXRMode(true);
      } else if (!state.session && prevState.session) {
        setXRMode(false);
      }
    });

    return () => {
      unsubStart();
    };
  }, [setXRMode]);

  return (
    <div className="xr-canvas-container">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          setGpuTier(detectGPUTier(gl.getContext()));
        }}
      >
        <XR store={guildXRStore}>
          <SceneContents gpuTier={gpuTier} isXRActive={isXRMode} />
        </XR>
      </Canvas>
    </div>
  );
}

export default XRScene;
