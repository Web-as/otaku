import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

function AvatarNode({ position, color, label }: { position: [number, number, number], color: string, label: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.2, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.1} color="white" anchorY="bottom">
        {label}
      </Text>
    </group>
  );
}

export function CommunityPlaza3D() {
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);

  if (activeXRMenu !== 'community') return null;

  return (
    <group position={[0, 0, 2]} rotation={[0, Math.PI, 0]}>
      {/* Plaza Base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      
      {/* Holographic Rings */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.9, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
      </mesh>
      
      <Text position={[0, 2, 0]} fontSize={0.2} color="#00f0ff">
        Community Hub (Live)
      </Text>

      {/* Mock Online Users */}
      <AvatarNode position={[-1, 1, -0.5]} color="#ec4899" label="Kirito_99" />
      <AvatarNode position={[1, 0.8, -1]} color="#8b5cf6" label="Asuna_Dev" />
      <AvatarNode position={[0, 1.2, -1.5]} color="#10b981" label="GachaKing" />
    </group>
  );
}

export default CommunityPlaza3D;
