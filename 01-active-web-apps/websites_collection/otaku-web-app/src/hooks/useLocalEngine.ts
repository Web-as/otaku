import { useState, useEffect } from 'react';

export interface LocalEngineStatus {
  connected: boolean;
  status: string;
  engine: string;
  hardware: {
    gpu: string;
    vram_mb: number;
    tier: 'high_mage' | 'mid_mage' | 'novice';
  } | null;
  error?: string;
}

export function useLocalEngine() {
  const [engineState, setEngineState] = useState<LocalEngineStatus>({
    connected: false,
    status: 'checking',
    engine: '',
    hardware: null,
  });

  const checkEngine = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for local ping
      
      const res = await fetch('http://localhost:8188/health', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setEngineState({
          connected: true,
          status: data.status,
          engine: data.engine,
          hardware: data.hardware,
        });
      } else {
        throw new Error('Engine responded with error');
      }
    } catch (err) {
      setEngineState({
        connected: false,
        status: 'disconnected',
        engine: '',
        hardware: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  useEffect(() => {
    checkEngine();
  }, []);

  return { ...engineState, checkEngine };
}
