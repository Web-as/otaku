'use client';

import { useEffect, useState } from 'react';

export type WebXRAvailability = {
  checked: boolean;
  hasWebXR: boolean;
  supportsVR: boolean;
  supportsAR: boolean;
  immersive: boolean;
};

export async function checkWebXRAvailability(): Promise<Omit<WebXRAvailability, 'checked'>> {
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return { hasWebXR: false, supportsVR: false, supportsAR: false, immersive: false };
  }

  const [supportsVR, supportsAR] = await Promise.all([
    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
    navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
  ]);

  return {
    hasWebXR: true,
    supportsVR,
    supportsAR,
    immersive: supportsVR || supportsAR,
  };
}

export function useWebXRAvailability(): WebXRAvailability {
  const [availability, setAvailability] = useState<WebXRAvailability>({
    checked: false,
    hasWebXR: false,
    supportsVR: false,
    supportsAR: false,
    immersive: false,
  });

  useEffect(() => {
    let cancelled = false;

    void checkWebXRAvailability().then((result) => {
      if (!cancelled) {
        setAvailability({ checked: true, ...result });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return availability;
}
