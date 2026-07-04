// Mock xrStore for MVP build
export const useXRStore = () => ({
  enterAR: () => {},
  enterVR: () => {},
  getState: () => ({ mode: 'inline' }),
});
export const xrStore = useXRStore();
export const guildXRStore = useXRStore();
