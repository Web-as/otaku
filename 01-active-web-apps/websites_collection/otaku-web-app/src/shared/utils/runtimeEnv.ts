/** Bridge Vite `VITE_*` and Next.js `NEXT_PUBLIC_*` env vars. */
type EnvRecord = Record<string, string | boolean | undefined>

function readProcess(key: string): string | undefined {
  const nextKey = key.startsWith('VITE_') ? `NEXT_PUBLIC_${key.slice(5)}` : key
  return process.env[nextKey] ?? process.env[key]
}

function viteEnv(): EnvRecord {
  try {
    return (import.meta as ImportMeta & { env?: EnvRecord }).env ?? {}
  } catch {
    return {}
  }
}

export function env(key: string, fallback = ''): string {
  const vite = viteEnv()[key]
  if (typeof vite === 'string' && vite.length > 0) return vite
  return readProcess(key) ?? fallback
}

export function envFlag(key: string): boolean {
  return env(key) === 'true'
}

export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}
