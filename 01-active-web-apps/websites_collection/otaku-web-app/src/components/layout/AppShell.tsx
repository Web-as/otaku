'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// const FloatingAgent = dynamic(
//   () => import('../tutorial/FloatingAgent').then(m => m.FloatingAgent),
//   { ssr: false }
// );

// const XRScene = dynamic(
//   () => import('../xr/XRScene').then(m => m.XRScene),
//   { ssr: false }
// );

// const XRHud = dynamic(
//   () => import('../xr/XRHud').then(m => m.XRHud),
//   { ssr: false }
// );

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [xrReady, setXrReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Defer heavy 3D scene loading to ensure instant initial page load
    const timer = setTimeout(() => {
      setXrReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // VN zone gets its own immersive layout (no shell chrome)
  const isAgentZone = pathname?.startsWith('/vn');

  return (
    <>
      {/* xrReady && <XRScene /> */}
      <div className="relative z-10 pointer-events-none w-full h-full">
        <div className="pointer-events-auto w-full h-full">
          {children}
        </div>
      </div>
      {/* xrReady && <XRHud /> */}
      {/* Floating agent — hidden on VN routes for immersion */}
      {/* mounted && !isAgentZone && <FloatingAgent /> */}
    </>
  );
}

export default AppShell;
