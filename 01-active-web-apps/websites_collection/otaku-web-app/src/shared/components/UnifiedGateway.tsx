import { useState } from 'react';
import '../styles/landing-anime.css';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { createPurchaseDetails, savePurchase, getPurchaseDetails } from '../utils/productKey';
import { PurchaseSuccessPage } from './PurchaseSuccessPage';
import { buyProgramDownload } from '../stripe';
import { getCurrentUser } from '../firebase';
import {
  LandingNav,
  LandingHero,
  LandingEcosystem,
  LandingIntegrations,
  LandingRoadmap,
  LandingEarlyAccess,
  LandingWhereNext,
  LandingFooter,
  type HubUrls,
} from './landing/LandingSections';
import { PreregisterQuestGame } from './PreregisterQuestGame';

export interface UnifiedGatewayProps {
  /** Canonical URLs for the three public sites + optional preregister SPA */
  hubUrls: HubUrls;
  /** DM Friend RPG base URL (optional) */
  dmFriendRpgUrl?: string;
  onLogin: () => void;
  /**
   * When set (e.g. program site with checkout modal), program pillar + early-access buttons
   * call this instead of in-component Stripe / demo purchase.
   */
  onEarlyAccessCheckout?: () => void;
}

export const UnifiedGateway = ({ hubUrls, dmFriendRpgUrl, onLogin, onEarlyAccessCheckout }: UnifiedGatewayProps) => {
  useMotionPreference(); /* applies data-motion on document */
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(getPurchaseDetails());

  const handleInternalPurchase = async () => {
    const user = getCurrentUser();

    if (!user) {
      window.alert('Please sign in first to purchase with Stripe, or continue for a demo purchase.');
      const shouldDemo = window.confirm('Continue with demo purchase (no payment)?');

      if (shouldDemo) {
        const details = createPurchaseDetails();
        savePurchase(details, { setLibraryTierCache: false });
        setPurchaseDetails(details);
        setShowSuccess(true);
      } else {
        onLogin();
      }
      return;
    }

    try {
      await buyProgramDownload(user.uid, user.email || '');
      console.error('Stripe redirect did not happen');
    } catch (error) {
      console.error('Checkout error:', error);
      window.alert(
        `Stripe checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}. Showing demo purchase instead.`,
      );
      const details = createPurchaseDetails();
      savePurchase(details);
      setPurchaseDetails(details);
      setShowSuccess(true);
    }
  };

  const runEarlyAccess = () => {
    if (onEarlyAccessCheckout) onEarlyAccessCheckout();
    else void handleInternalPurchase();
  };

  const handleContinueSuccess = () => {
    setShowSuccess(false);
    window.location.href = hubUrls.trackerUrl;
  };

  if (showSuccess && purchaseDetails) {
    return <PurchaseSuccessPage purchaseDetails={purchaseDetails} onContinue={handleContinueSuccess} />;
  }

  const programHrefOverride = !!onEarlyAccessCheckout;

  return (
    <div className="landing-anime-root min-h-[100dvh]">
      <a href="#guild-preregister-quest" className="landing-skip-link anime-focus-ring">
        Skip to guild preregister quest
      </a>
      <div className="landing-anime-grain" aria-hidden />
      <div className="landing-anime-content landing-tv-scale max-w-[100vw]">
        <LandingNav hubUrls={hubUrls} onLogin={onLogin} />

        <main id="landing-main">
        {/* Decorative hero stripe — replaces heavy bitmap until assets land */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="hud-panel hud-panel-cut overflow-hidden relative min-h-[120px] sm:min-h-[160px] border border-cyan-500/20">
            <div className="landing-motion-particles rounded-[inherit]" aria-hidden />
            <picture>
              <source type="image/svg+xml" srcSet="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop stop-color='%237c3aed'/%3E%3Cstop offset='0.5' stop-color='%23ec4899'/%3E%3Cstop offset='1' stop-color='%2322d3ee'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='%230a0612' width='1200' height='200'/%3E%3Cpath fill='url(%23g)' opacity='0.35' d='M0 120 L200 40 L400 160 L600 20 L800 140 L1000 60 L1200 100 L1200 200 L0 200 Z'/%3E%3C/svg%3E" />
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Crect fill='%2312101c' width='1200' height='200'/%3E%3C/svg%3E"
                alt=""
                className="w-full h-full object-cover opacity-90"
                width={1200}
                height={200}
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--anime-bg-deep)] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <LandingHero
          hubUrls={hubUrls}
          onPurchase={runEarlyAccess}
          onProgramPillarClick={programHrefOverride ? runEarlyAccess : undefined}
        />

        <PreregisterQuestGame hubUrls={hubUrls} dmFriendRpgUrl={dmFriendRpgUrl} />

        <LandingEcosystem hubUrls={hubUrls} onProgramCta={runEarlyAccess} />

        <LandingIntegrations />

        <LandingRoadmap />

        <LandingEarlyAccess onPurchase={runEarlyAccess} />

        <LandingWhereNext hubUrls={hubUrls} />

        <LandingFooter hubUrls={hubUrls} />
        </main>
      </div>
    </div>
  );
};
