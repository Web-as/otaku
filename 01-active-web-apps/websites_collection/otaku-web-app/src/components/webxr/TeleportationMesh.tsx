import React from 'react';
import { TeleportTarget } from '@react-three/xr';

export function TeleportationMesh() {
  return (
    <group>
      <TeleportTarget>
        {/* Invisible teleportation floor */}
        <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial />
        </mesh>
      </TeleportTarget>
    </group>
  );
}

export default TeleportationMesh;
