'use client';

import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, useXRHitTest } from '@react-three/xr';
import { Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const arXRStore = createXRStore();

interface ARItemProps {
  url: string;
  persistentHandle?: string;
  onPlace?: (handle: string, position?: THREE.Vector3) => void;
}

function MagicalArtifact({ url, position }: { url: string; position: THREE.Vector3 }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={[1, 1, 1]} position={position} />;
}

function HitTestPlacer({ url, onPlace }: { url: string; onPlace?: (id: string) => void }) {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [placedObjects, setPlacedObjects] = useState<{id: string, position: THREE.Vector3}[]>([]);

  useXRHitTest((results, getWorldMatrix) => {
    if (results.length === 0) {
      if (reticleRef.current) reticleRef.current.visible = false;
      return;
    }
    // Show reticle and update its position on flat surfaces
    if (reticleRef.current) {
      const matrixHelper = new THREE.Matrix4();
      getWorldMatrix(matrixHelper, results[0]);
      matrixHelper.decompose(
        reticleRef.current.position,
        reticleRef.current.quaternion,
        reticleRef.current.scale
      );
      reticleRef.current.visible = true;
    }
  }, 'viewer');

  const handlePointerDown = () => {
    if (reticleRef.current && reticleRef.current.visible) {
      const newId = `artifact-${Date.now()}`;
      setPlacedObjects(prev => [...prev, { id: newId, position: reticleRef.current!.position.clone() }]);
      if (onPlace) onPlace(newId);
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      {/* Holographic Reticle for targeting */}
      <mesh ref={reticleRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </mesh>
      
      {/* Render all placed artifacts */}
      {placedObjects.map((obj) => (
        <MagicalArtifact key={obj.id} url={url} position={obj.position} />
      ))}
    </group>
  );
}

export function ARViewer({ itemUrlGlb, itemUrlUsdz }: { itemUrlGlb: string; itemUrlUsdz?: string }) {
  const [sessionActive, setSessionActive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isIOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleEnterAR = async () => {
    if (isIOS && itemUrlUsdz) {
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', itemUrlUsdz);
      anchor.appendChild(document.createElement('img'));
      anchor.click();
      return;
    }

    setSessionActive(true);
    try {
      await arXRStore.enterAR();
    } catch (error) {
      console.error('WebXR AR session failed:', error);
      setSessionActive(false);
    }
  };

  React.useEffect(() => {
    const unsub = arXRStore.subscribe((state, prevState) => {
      if (!state.session && prevState.session) {
        setSessionActive(false);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="relative w-full h-[300px] bg-dark-bgSecondary flex flex-col items-center justify-center rounded-lg overflow-hidden border border-brand-cyan-neon/30">
      {!sessionActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <button
            onClick={() => void handleEnterAR()}
            className="px-6 py-3 bg-brand-cyan-neon text-dark-bg font-bold rounded-sm shadow-glow-cyan hover:bg-cyan-400 transition-colors"
          >
            Summon to Real World (AR)
          </button>
        </div>
      )}

      {/* DOM Overlay for AR */}
      <div 
        ref={overlayRef} 
        className={`absolute inset-0 pointer-events-none z-50 ${sessionActive ? 'block' : 'hidden'}`}
      >
        <div className="absolute top-4 right-4 pointer-events-auto">
          <button 
            onClick={() => arXRStore.getState().session?.end()}
            className="bg-red-500/80 text-white px-4 py-2 rounded-lg font-bold"
          >
            Close AR
          </button>
        </div>
        <div className="absolute bottom-10 left-0 right-0 text-center text-white pointer-events-none drop-shadow-md">
          <p className="bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur">
            Point camera at a flat surface and tap to place.
          </p>
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full">
        <Canvas>
          <XR store={arXRStore}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            {sessionActive && <HitTestPlacer url={itemUrlGlb} />}
          </XR>
        </Canvas>
      </div>
    </div>
  );
}

export default ARViewer;
