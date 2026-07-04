import React, { useState } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

const QUESTS = [
  { id: 1, title: 'Watch 3 Episodes', reward: '50 EXP', rarity: 'common', color: '#3b82f6' },
  { id: 2, title: 'Review an Anime', reward: '100 EXP + Rare Fragment', rarity: 'rare', color: '#8b5cf6' },
  { id: 3, title: 'Complete a Visual Novel', reward: 'Legendary Summon', rarity: 'legendary', color: '#f59e0b' },
];

function QuestCard({ quest, position }: { quest: any; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[1.5, 0.8, 0.05]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial 
          color="#0f172a" 
          emissive={hovered ? quest.color : '#000'}
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      {/* Holographic Border */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.4, 0.7]} />
        <meshBasicMaterial color={quest.color} wireframe transparent opacity={0.5} />
      </mesh>

      <Text position={[0, 0.15, 0.04]} fontSize={0.12} color="white" anchorY="middle">
        {quest.title}
      </Text>
      <Text position={[0, -0.15, 0.04]} fontSize={0.1} color={quest.color} anchorY="middle">
        Reward: {quest.reward}
      </Text>
    </group>
  );
}

export function QuestBoard3D() {
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);

  if (activeXRMenu !== 'quests') return null;

  return (
    <group position={[-2.5, 1, -1.5]} rotation={[0, Math.PI / 4, 0]}>
      {/* Main Board */}
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[2.5, 3, 0.2]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.5} roughness={0.7} />
      </mesh>

      <Text position={[0, 1.7, 0.05]} fontSize={0.2} color="#ff00ff">
        Adventurer's Board
      </Text>

      {/* Quest Cards */}
      {QUESTS.map((quest, index) => (
        <QuestCard 
          key={quest.id} 
          quest={quest} 
          position={[0, 1 - index * 0.9, 0.05]} 
        />
      ))}
    </group>
  );
}

export default QuestBoard3D;
