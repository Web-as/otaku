
import React, { useState, useEffect } from 'react';
import { Library, Users, LayoutGrid, RefreshCw, LogOut, Laptop, Shield, Menu, X, Palette } from 'lucide-react';
import LibraryCatalog from './components/LibraryCatalog';
import CommunityHub from './components/CommunityHub';
import DeviceSyncPanel from './components/DeviceSyncPanel';
import ProductLanding from './components/ProductLanding';
import LoginForm from './components/LoginForm';
import PublicBlog from './components/PublicBlog';
import AIAssistant from './components/AIAssistant';
import GatewayLanding from './components/GatewayLanding'; 
import CheckoutModal from './components/CheckoutModal'; // Import Checkout
import CreativeStudio from './components/CreativeStudio'; // Import Studio
import { useAuth } from './services/firebase';

type AppView = 'gateway' | 'landing' | 'login' | 'dashboard' | 'blog';
type DashboardTab = 'library' | 'community' | 'studio';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('gateway');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('library');
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false); // Checkout State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [region, setRegion] = useState<'LT' | 'EU'>('EU');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { userId } = useAuth();

  const handleRegionSelect = (selectedRegion: 'LT' | 'EU') => {
      setRegion(selectedRegion);
      setView('landing'); 
  };

  const handleLogin = (username: string) => {
      setIsAuthenticated(true);
      setView('dashboard');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setView('landing');
      setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Download Handler (Called after successful checkout)
  const executeDownload = () => {
    setShowCheckout(false);
    const element = document.createElement("a");
    const fileContent = `
=========================================
OTAKU GILDIJA CORE - FOUNDER'S EDITION
=========================================

Thank you for your purchase!
License Key: OTK-BETA-${Math.floor(Math.random() * 999999)}

[INSTALLATION]
1. Run Gildija_Core_Setup.exe
2. Enter your license key when prompted.
3. Sync with your web account.

Enjoy the automation!
    `;
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Gildija_Core_Setup_v2.4.0.exe.txt"; // Mock exe
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- RENDER LOGIC ---

  if (view === 'gateway') {
      return <GatewayLanding onEnter={handleRegionSelect} />;
  }

  if (view === 'landing') {
      return (
          <>
            <ProductLanding 
                onLoginClick={() => setView('login')} 
                onBlogClick={() => setView('blog')}
                onBuyClick={() => setShowCheckout(true)} 
            />
            <CheckoutModal 
                isOpen={showCheckout} 
                onClose={() => setShowCheckout(false)} 
                onComplete={executeDownload} 
            />
          </>
      );
  }

  if (view === 'blog') {
      return (
          <PublicBlog 
              onLoginClick={() => setView('login')}
              onHomeClick={() => setView('landing')}
          />
      );
  }

  if (view === 'login') {
      return <LoginForm onLogin={handleLogin} onCancel={() => setView('landing')} />;
  }

  // Dashboard View (Authenticated)
  return (
    <div className="min-h-screen bg-[#0f0e17] text-gray-100 flex flex-col font-sans overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0f0e17]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer group shrink-0" onClick={() => setDashboardTab('library')}>
              <Shield className="w-6 h-6 text-pink-500" />
              <span className="text-lg font-bold tracking-tight text-white uppercase">
                {region === 'LT' ? 'OTAKU GILDIJA' : 'LIBRARY OF OTAKU'} 
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setDashboardTab('library')}
                className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${
                  dashboardTab === 'library'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Library className="w-4 h-4 mr-2" />
                {region === 'LT' ? 'Archyvas' : 'Archive'}
              </button>
              <button
                onClick={() => setDashboardTab('community')}
                className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${
                  dashboardTab === 'community'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                {region === 'LT' ? 'Gildija' : 'Guild'}
              </button>
              
              <button
                onClick={() => setDashboardTab('studio')}
                className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${
                  dashboardTab === 'studio'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Palette className="w-4 h-4 mr-2" />
                Studio
              </button>

              <div className="h-4 w-px bg-gray-800 mx-4"></div>

              <button
                onClick={() => setShowSyncPanel(true)}
                className="flex items-center px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-900/10 border border-green-500/20 hover:bg-green-900/20 transition-all"
                title="Sync Status"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                {region === 'LT' ? 'Tinklas' : 'Online'}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-white transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-white p-2">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-[#0f0e17] border-b border-gray-800 animate-in slide-in-from-top-5 duration-200">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <button
                        onClick={() => { setDashboardTab('library'); setIsMobileMenuOpen(false); }}
                        className={`block w-full text-left px-3 py-3 rounded-md text-sm font-bold uppercase ${
                            dashboardTab === 'library' ? 'bg-gray-800 text-white' : 'text-gray-400'
                        }`}
                    >
                        <Library className="w-4 h-4 inline mr-3" />
                        {region === 'LT' ? 'Archyvas' : 'Archive'}
                    </button>
                    <button
                        onClick={() => { setDashboardTab('community'); setIsMobileMenuOpen(false); }}
                        className={`block w-full text-left px-3 py-3 rounded-md text-sm font-bold uppercase ${
                            dashboardTab === 'community' ? 'bg-gray-800 text-white' : 'text-gray-400'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-3" />
                        {region === 'LT' ? 'Gildija' : 'Guild'}
                    </button>
                    <button
                        onClick={() => { setDashboardTab('studio'); setIsMobileMenuOpen(false); }}
                        className={`block w-full text-left px-3 py-3 rounded-md text-sm font-bold uppercase ${
                            dashboardTab === 'studio' ? 'bg-gray-800 text-white' : 'text-gray-400'
                        }`}
                    >
                        <Palette className="w-4 h-4 inline mr-3" />
                        Studio
                    </button>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-3 rounded-md text-sm font-bold uppercase text-red-400 border-t border-gray-800 mt-2"
                    >
                        <LogOut className="w-4 h-4 inline mr-3" />
                        Atsijungti
                    </button>
                </div>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative w-full">
        {/* Soft Background Grid */}
        <div className="absolute inset-0 bg-[size:40px_40px] bg-anime-grid opacity-[0.03] pointer-events-none"></div>
        
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-8 relative z-10">
            {dashboardTab === 'library' && <LibraryCatalog userId={userId} />}
            {dashboardTab === 'community' && <CommunityHub userId={userId} />}
            {dashboardTab === 'studio' && <CreativeStudio />}
        </div>
      </main>

      {/* AI Assistant Overlay */}
      <AIAssistant />

      {/* Footer */}
      <footer className="bg-[#050507] border-t border-gray-900 py-6 mt-12 font-mono">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-600 uppercase tracking-widest">
          <p>© 2024 {region === 'LT' ? 'OTAKU GILDIJA LT' : 'LIBRARY OF OTAKU'}. SYSTEM v2.4.0-BETA</p>
        </div>
      </footer>

      {/* Overlays */}
      {showSyncPanel && (
        <DeviceSyncPanel onClose={() => setShowSyncPanel(false)} />
      )}
      <CheckoutModal 
         isOpen={showCheckout} 
         onClose={() => setShowCheckout(false)} 
         onComplete={executeDownload} 
      />
    </div>
  );
};

export default App;
