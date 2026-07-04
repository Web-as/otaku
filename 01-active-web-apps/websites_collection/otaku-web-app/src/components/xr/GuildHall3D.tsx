import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function GuildHall3D() {
  const group = useRef<THREE.Group>(null);

  // Slow rotation for ambient effect
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#0a0a0c" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid Floor Lines for spatial awareness */}
      <gridHelper args={[50, 50, '#164e63', '#111827']} position={[0, -0.49, 0]} />

      {/* Holographic Pedestal (Center) */}
      <mesh position={[0, 0, -3]} castShadow>
        <cylinderGeometry args={[1, 1.2, 1, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Neon Ring around Pedestal */}
      <mesh position={[0, 0.5, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.35, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
      </mesh>

      {/* Ambient Lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Cyberpunk Neon Lights */}
      <pointLight position={[0, 3, -3]} color="#ff00ff" intensity={0.5} distance={10} />
      <pointLight position={[-4, 2, 0]} color="#00f0ff" intensity={0.8} distance={15} />
      <pointLight position={[4, 2, 0]} color="#8b5cf6" intensity={0.8} distance={15} />
      
      <Environment preset="night" />
    </group>
  );
}

export default GuildHall3D;
