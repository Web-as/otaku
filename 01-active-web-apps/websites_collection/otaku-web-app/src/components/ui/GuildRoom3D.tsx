'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { XR, XROrigin } from '@react-three/xr';
import { Stars, Float, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useMotionPreference } from '@/shared/hooks/useMotionPreference';
import { guildXRStore } from '@/lib/webxr/xrStore';
import { SpatialUI } from '../webxr/SpatialUI';
import { TeleportationMesh } from '../webxr/TeleportationMesh';
import { LibraryShelves3D } from '../webxr/LibraryShelves3D';
import { XRSync } from '../webxr/XRSync';

const GuildCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#8b5cf6" wireframe emissive="#ec4899" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
};

export const GuildRoom3D: React.FC = () => {
  const { isReduced } = useMotionPreference();

  if (isReduced) {
    return (
      <div
        className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-b from-[#0f0e17] via-[#1a1033] to-[#0f0e17]"
        aria-hidden
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0f0e17]">
      <Canvas>
        <XR store={guildXRStore}>
          <XROrigin position={[0, 0, 0]} />
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <GuildCore />
          <SpatialUI />
          <LibraryShelves3D />
          <TeleportationMesh />
          <XRSync />
          <Environment preset="night" />
        </XR>
      </Canvas>
    </div>
  );
};

export default GuildRoom3D;
