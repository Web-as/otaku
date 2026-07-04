import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Library, Users, Bot, Settings, LogOut, Menu, X, Sparkles, Trophy, Star, Award, Shield, Scan, Coins, Zap, CreditCard, Backpack, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserTier } from '../types/types';
// import GuildRoom3D from '../components/ui/GuildRoom3D';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';
import { pathNeedsLibraryPass } from '@/shared/membership/passPrompt';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { buyLibraryPass } from '@/shared/stripe/checkout';
import { getCurrentUser } from '@/lib/firebase';
import { GamificationBar } from '@/shared/components/GamificationBar';
import WebXRControls from '@/components/webxr/WebXRControls';
import { useSyncStore } from '@/lib/webxr/syncStore';

interface AppLayoutProps {
  userTier: UserTier;
  onUpgrade: () => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ userTier, onUpgrade, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { status } = useMembership();
  const isXRMode = useSyncStore((state) => state.isXRMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasPass = status ? canAccessMemberLibrary(status) : false;
  const devBypass =
    user?.role === 'super_user' ||
    user?.role === 'vip' ||
    user?.role === 'op' ||
    user?.tier === 'premium';
  const needsPass = !devBypass && !hasPass;

  const handleLogout = () => {
    logout();
    navigateWithTransition('/');
  };

  const navigateWithTransition = (path: string) => {
    setSidebarOpen(false);
    if (!document.startViewTransition) {
      router.push(path);
      return;
    }
    document.startViewTransition(() => {
      router.push(path);
    });
  };

  const navItems = [
    { path: '/app/membership', icon: CreditCard, label: 'Membership' },
    { path: '/app/my-blog', icon: PenTool, label: 'My Blog' },
    { path: '/app/inventory', icon: Backpack, label: 'Inventory' },
    { path: '/app/library', icon: Library, label: 'Library', tourId: 'library' },
    { path: '/app/scanner', icon: Scan, label: 'Scanner', tourId: 'scanner' },
    { path: '/app/quests', icon: Trophy, label: 'Quests', tourId: 'quests' },
    { path: '/app/collectibles', icon: Star, label: 'Collectibles', tourId: 'collectibles' },
    { path: '/app/leaderboard', icon: Award, label: 'Leaderboard' },
    { path: '/app/community', icon: Users, label: 'Community' },
    { path: '/app/assistant', icon: Bot, label: 'AI Assistant' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNavItems = [
    { path: '/app/admin', icon: Shield, label: 'Admin Panel', requiresRole: ['op', 'super_user'] },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-transparent">
      {/* 3D WebGPU Background */}
      {/* <GuildRoom3D /> */}

      {/* Top Navigation Bar */}
      <nav className={`border-b border-gray-800 bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-50 transition-opacity duration-700 ease-in-out ${isXRMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link href="/app" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OG</span>
                </div>
                <span className="font-bold text-lg hidden sm:block">Otaku Gildija</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <WebXRControls compact />
              <div className="hidden md:block">
                <GamificationBar />
              </div>

              {/* Tier Badge */}
              {needsPass ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (user?.uid && user.email) await buyLibraryPass(user.uid, user.email);
                    else onUpgrade();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-violet-600 hover:from-amber-500 hover:to-violet-500 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-black uppercase tracking-widest">Library Pass</span>
                </button>
              ) : userTier === 'free' ? (
                <button
                  onClick={onUpgrade}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-black uppercase tracking-widest">Upgrade €1</span>
                </button>
              ) : (
                <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-violet-500/30 rounded-lg">
                  <span className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Premium</span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`flex transition-opacity duration-700 ease-in-out ${isXRMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1a1a2e] border-r border-gray-800 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-16 lg:mt-0
        `}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const locked = needsPass && pathNeedsLibraryPass(item.path);
              const isInventory = item.path === '/app/inventory';

              return (
                <button
                  key={item.path}
                  data-tour-id={'tourId' in item ? item.tourId : undefined}
                  onClick={() => navigateWithTransition(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border-l-4
                    ${isActive 
                      ? 'bg-violet-600 text-white border-pink-500' 
                      : 'text-gray-400 border-transparent hover:bg-gray-800 hover:text-white hover:border-gray-600'
                    }
                    ${isInventory && needsPass ? 'ring-1 ring-amber-500/40' : ''}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {locked && (
                    <span className="text-[10px] uppercase text-amber-400/90 font-bold">Pass</span>
                  )}
                  {isInventory && needsPass && (
                    <span className="text-[10px] text-amber-300">Get card</span>
                  )}
                </button>
              );
            })}

            {needsPass && (
              <LibraryPassCTA variant="sidebar" context="inventory" hasPass={hasPass} />
            )}

            {/* Admin Section */}
            {(user?.role === 'op' || user?.role === 'super_user') && (
              <>
                <div className="border-t border-gray-800 my-4" />
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigateWithTransition(item.path)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-red-600 text-white' 
                          : 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
