import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Plane, useVideoTexture } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

export function VNTheater3D() {
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);
  
  if (activeXRMenu !== 'vn') return null;

  return (
    <group position={[0, 1.5, -4]}>
      {/* Theater Screen Frame */}
      <mesh position={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[6.2, 3.6, 0.2]} />
        <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Screen (Black for now, can map video/textures here) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6, 3.4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      <Text position={[0, 0, 0.05]} fontSize={0.2} color="#ffffff">
        Visual Novel Theater Offline
      </Text>
      
      {/* Cinematic Lighting */}
      <spotLight position={[0, 5, 2]} angle={0.5} penumbra={1} intensity={1} color="#ff00ff" />
      <spotLight position={[-4, -2, 2]} angle={0.5} penumbra={1} intensity={0.5} color="#00f0ff" />
      <spotLight position={[4, -2, 2]} angle={0.5} penumbra={1} intensity={0.5} color="#00f0ff" />
    </group>
  );
}

export default VNTheater3D;
