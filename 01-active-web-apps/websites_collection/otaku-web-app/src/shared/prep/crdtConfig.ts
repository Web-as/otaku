/**
 * CRDT relay configuration (prep for production Yjs — replaces demos.yjs.dev).
 * Sources: websites_theory/yjs_crdt_realtime_theory.md, ADV_05_CRDT_P2P_Gaming
 */

export type CrdtRuntimeConfig = {
  websocketUrl: string;
  defaultRoom: string;
  persistDbName: string;
};

const DEMO_RELAY = 'wss://demos.yjs.dev';

export function getCrdtWebsocketUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env) {
    const vite = (import.meta as { env: Record<string, string> }).env;
    if (vite.VITE_YJS_WS_URL) return vite.VITE_YJS_WS_URL;
  }
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_YJS_WS_URL) {
    return process.env.NEXT_PUBLIC_YJS_WS_URL;
  }
  if (typeof process !== 'undefined' && process.env?.YJS_WS_URL) {
    return process.env.YJS_WS_URL;
  }
  return DEMO_RELAY;
}

export function getCrdtConfig(overrides?: Partial<CrdtRuntimeConfig>): CrdtRuntimeConfig {
  return {
    websocketUrl: overrides?.websocketUrl ?? getCrdtWebsocketUrl(),
    defaultRoom: overrides?.defaultRoom ?? 'global-inventory-room',
    persistDbName: overrides?.persistDbName ?? 'otaku-hybrid-db',
  };
}

export function isDemoCrdtRelay(url = getCrdtWebsocketUrl()): boolean {
  return url.includes('demos.yjs.dev');
}
