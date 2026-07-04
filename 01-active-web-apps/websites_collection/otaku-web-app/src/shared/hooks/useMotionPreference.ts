import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'otaku_motion_preference';

export type MotionPreference = 'full' | 'reduced';

function readStored(): MotionPreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'reduced' || v === 'full') return v;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }
  return 'full';
}

function applyToDocument(pref: MotionPreference) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.motion = pref === 'reduced' ? 'reduced' : 'full';
}

export function useMotionPreference() {
  const [preference, setPreference] = useState<MotionPreference>('full');

  useEffect(() => {
    const initial = readStored();
    setPreference(initial);
    applyToDocument(initial);
  }, []);

  const setMotion = useCallback((pref: MotionPreference) => {
    setPreference(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* ignore */
    }
    applyToDocument(pref);
  }, []);

  const toggle = useCallback(() => {
    setMotion(preference === 'reduced' ? 'full' : 'reduced');
  }, [preference, setMotion]);

  return { preference, setMotion, toggle, isReduced: preference === 'reduced' };
}
