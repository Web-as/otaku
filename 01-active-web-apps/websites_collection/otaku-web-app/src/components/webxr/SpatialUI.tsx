import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

interface ButtonProps {
  position: [number, number, number];
  label: string;
  onClick: () => void;
  color?: string;
}

function XRButton({ position, label, onClick, color = '#3b82f6' }: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[1.5, 0.4, 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#60a5fa' : color}
          emissive={hovered ? '#3b82f6' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export function SpatialUI() {
  const activeXRMenu = useSyncStore((state) => state.activeXRMenu);
  const setActiveXRMenu = useSyncStore((state) => state.setActiveXRMenu);

  return (
    <group position={[0, 1.5, -2]}>
      {/* Holographic Backing */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.2, 2.2]} />
        <meshStandardMaterial color="#c084fc" transparent opacity={0.15} wireframe />
      </mesh>
      {/* Main Panel Background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#0f0e17" transparent opacity={0.85} side={THREE.DoubleSide} emissive="#1a103c" emissiveIntensity={0.5} />
      </mesh>

      {/* Header */}
      <Text
        position={[0, 0.7, 0.05]}
        fontSize={0.25}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#8b5cf6"
      >
        ❖ Welcome to the Isekai Hub ❖
      </Text>

      {/* Menu Options */}
      {activeXRMenu === 'main' && (
        <group>
          <XRButton
            position={[-1.2, 0.1, 0]}
            label="Anime Grimoire"
            onClick={() => setActiveXRMenu('library')}
            color="#ec4899"
          />
          <XRButton
            position={[0, 0.1, 0]}
            label="Adventurer's Board"
            onClick={() => setActiveXRMenu('quests')}
            color="#8b5cf6"
          />
          <XRButton
            position={[1.2, 0.1, 0]}
            label="Hero Status"
            onClick={() => setActiveXRMenu('profile')}
            color="#14b8a6"
          />
        </group>
      )}

      {/* Sub-menus */}
      {activeXRMenu !== 'main' && (
        <group>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.18}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {activeXRMenu === 'library' && 'Summoning your Anime Grimoire...'}
            {activeXRMenu === 'quests' && 'Detecting local disturbances...'}
            {activeXRMenu === 'profile' && 'Calculating Hero Stats...'}
          </Text>
          <XRButton
            position={[0, -0.5, 0]}
            label="<< Return"
            onClick={() => setActiveXRMenu('main')}
            color="#475569"
          />
        </group>
      )}
    </group>
  );
}

export default SpatialUI;
