'use client';

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, LogIn, CreditCard } from 'lucide-react';

const PublicLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Public Navigation */}
      <nav className="border-b border-gray-800 bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OG</span>
              </div>
              <span className="font-bold text-lg">Otaku Gildija</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 hover:text-violet-400 transition-colors">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link href="/pricing" className="flex items-center space-x-2 hover:text-violet-400 transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
              <Link
                href="/auth"
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-200 hover:bg-amber-500/10 text-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Library Pass</span>
              </Link>
              <Link href="/auth" className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-amber-950/50 to-violet-950/50 border-b border-amber-500/20 px-4 py-2 text-center text-sm text-gray-300">
        Want <strong className="text-amber-200">inventory unlocked</strong>? Register, then get your{' '}
        <strong className="text-white">Library Admission Card</strong> with the Library Pass (~€2.50/mo).{' '}
        <Link href="/auth" className="text-violet-400 hover:underline font-semibold">
          Start here →
        </Link>
      </div>

      {/* Page Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Otaku Gildija</h3>
              <p className="text-gray-400 text-sm">
                Your complete anime library management platform with AI assistance and community features.
                Runs in any modern browser, with optional WebXR VR and AR on supported devices.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-violet-400">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-violet-400">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-violet-400">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-violet-400">Privacy Policy</a></li>
                <li><a href="/" className="hover:text-violet-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2026 Otaku Gildija. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
