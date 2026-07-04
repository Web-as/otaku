import { create } from 'zustand';
import * as THREE from 'three';

interface SyncStoreState {
  isXRMode: boolean;
  setXRMode: (isXR: boolean) => void;
  activeXRMenu: string | null;
  setActiveXRMenu: (menu: string | null) => void;
  lastInteractedItem: string | null;
  setLastInteractedItem: (item: string | null) => void;
  
  // Spatial Tracking
  playerPosition: THREE.Vector3;
  setPlayerPosition: (pos: THREE.Vector3) => void;
  gazeDirection: THREE.Vector3;
  setGazeDirection: (dir: THREE.Vector3) => void;
  handTrackingState: 'none' | 'left' | 'right' | 'both';
  setHandTrackingState: (state: 'none' | 'left' | 'right' | 'both') => void;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  isXRMode: false,
  setXRMode: (isXR) => set({ isXRMode: isXR }),
  activeXRMenu: 'main',
  setActiveXRMenu: (menu) => set({ activeXRMenu: menu }),
  lastInteractedItem: null,
  setLastInteractedItem: (item) => set({ lastInteractedItem: item }),
  
  playerPosition: new THREE.Vector3(0, 0, 0),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  gazeDirection: new THREE.Vector3(0, 0, -1),
  setGazeDirection: (dir) => set({ gazeDirection: dir }),
  handTrackingState: 'none',
  setHandTrackingState: (state) => set({ handTrackingState: state }),
}));
