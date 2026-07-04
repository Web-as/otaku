import { useEffect } from 'react';
import { useXR } from '@react-three/xr';
import { useSyncStore } from '@/lib/webxr/syncStore';

export function XRSync() {
  const session = useXR((state) => state.session);
  const setXRMode = useSyncStore((state) => state.setXRMode);

  useEffect(() => {
    setXRMode(!!session);
  }, [session, setXRMode]);

  return null;
}
