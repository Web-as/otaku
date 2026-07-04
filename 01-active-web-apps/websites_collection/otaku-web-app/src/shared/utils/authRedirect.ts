/**
 * Auth Redirect Utility
 * Handles safe redirects after login across all sites
 * Contract: /login?redirect=<encoded-url>
 */

const REDIRECT_KEY = 'auth_redirect_url';

// Allowlist of safe redirect origins (same-origin by default)
const STATIC_ALLOWED_ORIGINS = [
  'http://localhost:5173', // Blog
  'http://localhost:5176', // LT Tracker
  'http://localhost:5175', // EU Sales
  'http://localhost:3000', // Unified (rebuilt)
  'http://localhost:3001', // Blog (rebuilt)
  'http://localhost:3002', // Profiles (rebuilt)
  'http://localhost:3003', // DM Friend RPG (rebuilt)
  'http://localhost:3004', // Preregister site
];

function originsFromEnv(): string[] {
  try {
    const raw = import.meta.env?.VITE_AUTH_REDIRECT_ORIGINS as string | undefined;
    if (!raw?.trim()) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function allowedOrigins(): string[] {
  const extra = originsFromEnv();
  const merged = [...STATIC_ALLOWED_ORIGINS, ...extra];
  return Array.from(new Set(merged));
}

/**
 * Get the redirect URL from query params or sessionStorage
 */
export function getRedirectUrl(): string | null {
  // First check URL params
  const params = new URLSearchParams(window.location.search);
  const redirectParam = params.get('redirect');
  
  if (redirectParam) {
    try {
      const decodedUrl = decodeURIComponent(redirectParam);
      if (isSafeRedirect(decodedUrl)) {
        return decodedUrl;
      }
    } catch (e) {
      console.warn('Invalid redirect URL in params:', e);
    }
  }
  
  // Fallback to sessionStorage
  const storedRedirect = sessionStorage.getItem(REDIRECT_KEY);
  if (storedRedirect && isSafeRedirect(storedRedirect)) {
    return storedRedirect;
  }
  
  return null;
}

/**
 * Set redirect URL in sessionStorage before navigating to login
 */
export function setRedirectUrl(url: string): void {
  if (isSafeRedirect(url)) {
    sessionStorage.setItem(REDIRECT_KEY, url);
  }
}

/**
 * Clear stored redirect URL
 */
export function clearRedirectUrl(): void {
  sessionStorage.removeItem(REDIRECT_KEY);
}

/**
 * Perform safe redirect after login
 * @param fallbackUrl - URL to use if no redirect is set
 */
export function safeRedirect(fallbackUrl: string = '/'): void {
  const redirectUrl = getRedirectUrl();
  
  if (redirectUrl) {
    clearRedirectUrl();
    window.location.href = redirectUrl;
  } else {
    window.location.href = fallbackUrl;
  }
}

/**
 * Check if a URL is safe to redirect to
 * Only allows same-origin or allowlisted origins
 */
function isSafeRedirect(url: string): boolean {
  try {
    const trimmed = url.trim();
    // Path-only redirects: reject protocol-relative `//evil.com` and backslash tricks
    if (trimmed.startsWith('/')) {
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/\\') ||
        trimmed.toLowerCase().includes('//') ||
        /[/\\][/\\]/.test(trimmed)
      ) {
        return false;
      }
      const resolved = new URL(trimmed, window.location.origin);
      return resolved.origin === window.location.origin;
    }

    const urlObj = new URL(trimmed);
    const currentOrigin = window.location.origin;

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    if (urlObj.origin === currentOrigin) {
      return true;
    }

    return allowedOrigins().includes(urlObj.origin);
  } catch {
    return false;
  }
}

/**
 * Build login URL with redirect parameter
 * @param loginPath - Path to login page (default: /login)
 * @param returnUrl - URL to return to after login (default: current URL)
 */
export function buildLoginUrl(loginPath: string = '/login', returnUrl?: string): string {
  const redirect = returnUrl || window.location.href;
  const encodedRedirect = encodeURIComponent(redirect);
  
  // If loginPath is relative, use current origin
  if (loginPath.startsWith('/')) {
    return `${loginPath}?redirect=${encodedRedirect}`;
  }
  
  // If loginPath is absolute, append redirect param
  const url = new URL(loginPath);
  url.searchParams.set('redirect', encodedRedirect);
  return url.toString();
}

/**
 * Navigate to login with redirect
 * @param loginUrl - Full login URL or path
 * @param returnUrl - URL to return to after login
 */
export function navigateToLogin(loginUrl: string = '/login', returnUrl?: string): void {
  const redirect = returnUrl || window.location.href;
  setRedirectUrl(redirect);
  
  if (loginUrl.startsWith('/')) {
    window.location.href = buildLoginUrl(loginUrl, redirect);
  } else {
    window.location.href = loginUrl;
  }
}
