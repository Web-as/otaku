import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

export function GachaSummon3D() {
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);
  const ringRef = useRef<THREE.Group>(null);
  const [summoning, setSummoning] = useState(false);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * (summoning ? 5 : 0.5);
    }
  });

  if (activeXRMenu !== 'gacha' && activeXRMenu !== 'main') return null;

  return (
    <group position={[2.5, 0, 2]}>
      {/* Summoning Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.1, 32]} />
        <meshStandardMaterial color="#0f0e17" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Magic Circles */}
      <group ref={ringRef} position={[0, 0.11, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 64]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Inner runes (simulated with dashed ring) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.9, 32]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} side={THREE.DoubleSide} wireframe />
        </mesh>
      </group>

      <Text position={[0, 1.5, 0]} fontSize={0.2} color="#ff00ff" anchorY="middle">
        Summoning Shrine
      </Text>

      {/* Crystal/Button */}
      <group position={[0, 0.8, 0]} onClick={() => setSummoning(true)}>
        <mesh castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={summoning ? "#ffffff" : "#ff00ff"} emissive={summoning ? "#ff00ff" : "#8b5cf6"} emissiveIntensity={ summoning ? 2 : 0.5 } wireframe={summoning} />
        </mesh>
        {summoning && (
          <pointLight color="#ff00ff" intensity={2} distance={5} />
        )}
      </group>
    </group>
  );
}

export default GachaSummon3D;
