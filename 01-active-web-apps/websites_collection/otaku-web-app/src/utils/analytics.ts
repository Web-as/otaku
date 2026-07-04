// Analytics integration utility

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    gtag?: (...args: any[]) => void;
  }
}

export const analytics = {
  // Track page view
  pageView: (url: string) => {
    if (window.plausible) {
      window.plausible('pageview');
    }
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    }
  },

  // Track custom event
  event: (eventName: string, properties?: Record<string, any>) => {
    if (window.plausible) {
      window.plausible(eventName, { props: properties });
    }
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  },

  // Track user signup
  trackSignup: (method: string) => {
    analytics.event('signup', { method });
  },

  // Track upgrade
  trackUpgrade: (tier: string, purchaseType: string) => {
    analytics.event('upgrade', { tier, purchase_type: purchaseType });
  },

  // Track quest completion
  trackQuestComplete: (questId: string, questType: string) => {
    analytics.event('quest_complete', { quest_id: questId, quest_type: questType });
  },

  // Track post creation
  trackPostCreate: (status: string) => {
    analytics.event('post_create', { status });
  },

  // Track anime added
  trackAnimeAdd: (source: string) => {
    analytics.event('anime_add', { source });
  },
};

// Initialize analytics
export const initAnalytics = () => {
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  
  if (plausibleDomain) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = plausibleDomain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }
};
