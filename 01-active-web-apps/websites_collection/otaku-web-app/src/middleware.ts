import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporary site lockdown flag
const IS_SITE_LOCKED = true;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // 1. Lockdown logic
  if (IS_SITE_LOCKED) {
    // Check if user has early access
    const hasEarlyAccess = request.cookies.has('early_access_unlocked');
    
    // Always allow API routes, auth, static files, and the preregister page
    const isPublicRoute = 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/auth') || 
      url.pathname === '/preregister' ||
      url.pathname.includes('.'); // Static files like .css, .js, .png
      
    if (!hasEarlyAccess && !isPublicRoute) {
      // Nano Banana "Tease & Convert" Strategy:
      // We no longer redirect away. We let them enter the page, 
      // but the UI will render the RestrictedOverlay to blur the content and induce FOMO.
      // (The actual sensitive API data should still be secured on the backend).
    }
  }

  // Get the hostname (e.g., 'libraryofotaku.net', 'otakubiblioteka.lt', or 'localhost:3000')
  const hostname = request.headers.get('host');

  // Define paths that bypass the domain routing (API, static files, specific routes)
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/app') ||
    url.pathname.startsWith('/vn') ||
    url.pathname === '/preregister' ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rewrite based on the host
  // 1. Blog Domain
  if (hostname === 'libraryofotaku.blog' || hostname === 'blog.localhost:3000') {
    url.pathname = `/blog${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Tracker Domain
  if (hostname === 'otakubiblioteka.lt' || hostname === 'tracker.localhost:3000') {
    url.pathname = `/tracker${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. Default / Net Domain
  // Temporarily route the main landing page to the preregister page
  if (url.pathname === '/') {
    url.pathname = '/preregister';
    return NextResponse.rewrite(url);
  }

  // Any other domain (like libraryofotaku.net or standard localhost:3000) falls back to the .net product page
  url.pathname = `/net${url.pathname}`;
  return NextResponse.rewrite(url);
}

// Ensure the middleware only runs on routes we actually care about rewriting
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
