import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSyncStore } from '@/lib/webxr/syncStore';
import * as THREE from 'three';

export function FlatScreenFallback() {
  const isXRMode = useSyncStore((state) => state.isXRMode);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Initialize camera for flat screen mode
  React.useEffect(() => {
    if (!isXRMode) {
      camera.position.set(0, 1.6, 2);
      camera.lookAt(0, 1.5, -3);
    }
  }, [isXRMode, camera]);

  if (isXRMode) return null; // Let XR controllers handle camera when in XR

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={1}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2 + 0.1} // Prevent going too far below the floor
        target={[0, 1.5, -3]}
        makeDefault
      />
    </>
  );
}

export default FlatScreenFallback;
