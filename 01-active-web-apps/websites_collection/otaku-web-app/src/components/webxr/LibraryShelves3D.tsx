import React, { useEffect, useState, useRef } from 'react';
import { Text, useTexture, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAuth } from '@/contexts/AuthContext';
import { getAnimeLibrary, AnimeEntry } from '@/shared/supabase/database';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

function AnimeBook({ anime, index }: { anime: AnimeEntry; index: number }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  
  // Position calculated based on index
  const x = -1.2 + (index % 5) * 0.6;
  const y = 1.5 - Math.floor(index / 5) * 0.8;
  const targetZ = hovered ? -0.05 : -0.2;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 10);
    }
  });

  // Color mapping based on status
  const getColor = () => {
    if (anime.status === 'completed') return '#10b981';
    if (anime.status === 'watching') return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <group 
      ref={meshRef}
      position={[x, y, -0.2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[0.4, 0.6, 0.1]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={getColor()} roughness={0.3} metalness={0.1} />
      </RoundedBox>
      <Text 
        position={[0, 0, 0.055]} 
        fontSize={0.06} 
        color="white" 
        maxWidth={0.36} 
        textAlign="center"
        outlineWidth={0.005}
        outlineColor="black"
      >
        {anime.title}
      </Text>
      
      {/* Glow effect on hover */}
      {hovered && (
        <pointLight position={[0, 0, 0.2]} distance={1} intensity={0.5} color={getColor()} />
      )}
    </group>
  );
}

export function LibraryShelves3D() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<AnimeEntry[]>([]);
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);

  useEffect(() => {
    if (user?.uid && activeXRMenu === 'library') {
      getAnimeLibrary(user.uid)
        .then((data) => setLibrary(data || []))
        .catch(console.error);
    }
  }, [user?.uid, activeXRMenu]);

  if (activeXRMenu !== 'library') return null;

  return (
    <group position={[2, 0, -2]} rotation={[0, -Math.PI / 4, 0]}>
      {/* High Quality Shelf Frame */}
      <mesh position={[0, 1, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.2, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Shelf details (glowing edges) */}
      <mesh position={[0, 1, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 2.3, 0.1]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.2} wireframe />
      </mesh>

      <Text position={[0, 2.4, -0.1]} fontSize={0.25} color="#00f0ff" font="/fonts/outfit.woff">
        Anime Grimoire
      </Text>

      {library.length === 0 && (
        <Text position={[0, 1, 0]} fontSize={0.15} color="#9ca3af">
          Your library is empty.
        </Text>
      )}

      {library.map((anime, index) => (
        <AnimeBook key={anime.anime_id || index} anime={anime} index={index} />
      ))}
    </group>
  );
}

export default LibraryShelves3D;
