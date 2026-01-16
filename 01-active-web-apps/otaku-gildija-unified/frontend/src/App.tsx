import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Library as LibraryIcon, Users, Palette } from 'lucide-react';
import { LanguageProvider, useLanguage } from './services/i18n';
import { useAuth } from './services/firebase';
import ProductLanding from './components/landing/ProductLanding';
import PublicBlog from './components/landing/PublicBlog';
import LoginForm from './components/auth/LoginForm';
import CheckoutModal from './components/auth/CheckoutModal';
import FeatureOverlay from './components/FeatureOverlay';
import LibraryCatalog from './components/features/LibraryCatalog';
import CommunityHub from './components/community/CommunityHub';
import CreativeStudio from './components/features/CreativeStudio';
import AIAssistant from './components/features/AIAssistant';
import Library from './components/library/Library';
import FreeTierLibrary from './components/library/FreeTierLibrary';
import { UserTier } from './types/types';

type ActiveOverlay = 'none' | 'library' | 'community' | 'studio';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { userId, loading } = useAuth();
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>('none');
  const [showCheckout, setShowCheckout] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>('free');

  useEffect(() => {
    const savedTier = localStorage.getItem('userTier') as UserTier;
    if (savedTier) setUserTier(savedTier);
  }, []);

  const handleUpgrade = () => {
    setUserTier('premium');
    localStorage.setItem('userTier', 'premium');
  };

  const executeDownload = () => {
    setShowCheckout(false);
    const element = document.createElement("a");
    const file = new Blob([`License: OTK-${Math.floor(Math.random() * 999999)}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "Gildija_License.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/blog" element={
        <PublicBlog onLoginClick={() => navigate('/login')} onHomeClick={() => navigate('/')} />
      } />

      <Route path="/login" element={
        <LoginForm onLogin={() => navigate('/')} onCancel={() => navigate('/')} />
      } />

      <Route path="/demo" element={
        userTier === 'free' ? <FreeTierLibrary onUpgrade={handleUpgrade} /> : <Library />
      } />

      <Route path="/*" element={
        <>
          <div className={`transition-all duration-500 ${activeOverlay !== 'none' ? 'scale-[0.98] opacity-20 blur-sm pointer-events-none fixed w-full h-full overflow-hidden' : ''}`}>
            <ProductLanding
              onLoginClick={() => navigate('/login')}
              onBlogClick={() => navigate('/blog')}
              onBuyClick={() => setShowCheckout(true)}
              onLaunchLibrary={() => setActiveOverlay('library')}
              onLaunchGuild={() => setActiveOverlay('community')}
              onLaunchStudio={() => setActiveOverlay('studio')}
            />
          </div>

          <FeatureOverlay isOpen={activeOverlay === 'library'} onClose={() => setActiveOverlay('none')} title={t.nav.library} icon={<LibraryIcon className="w-5 h-5" />}>
            <LibraryCatalog userId={userId} onLaunchBlog={() => navigate('/blog')} />
          </FeatureOverlay>

          <FeatureOverlay isOpen={activeOverlay === 'community'} onClose={() => setActiveOverlay('none')} title={t.nav.guild} icon={<Users className="w-5 h-5" />}>
            <CommunityHub userId={userId} onLaunchBlog={() => navigate('/blog')} />
          </FeatureOverlay>

          <FeatureOverlay isOpen={activeOverlay === 'studio'} onClose={() => setActiveOverlay('none')} title={t.nav.studio} icon={<Palette className="w-5 h-5" />}>
            <CreativeStudio />
          </FeatureOverlay>

          <AIAssistant />

          <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onComplete={executeDownload} />
        </>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
