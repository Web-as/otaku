// Shared Stripe Checkout Functions for All 3 Sites
import { STRIPE_PRICES } from './config';
import { isStripeHostedCheckoutUrl } from './safeStripeRedirect';

export interface CheckoutOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  mode?: 'payment' | 'subscription';
}

// Generic checkout redirect using backend API
export const redirectToCheckout = async (options: CheckoutOptions) => {
  console.log('🔷 Starting Stripe checkout with options:', {
    priceId: options.priceId,
    mode: options.mode,
    email: options.customerEmail
  });

  try {
    // Call backend to create checkout session
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';
    
    const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: options.priceId,
        mode: options.mode ?? 'payment',
        userId: options.metadata?.userId,
        userEmail: options.customerEmail,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        metadata: options.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    if (!isStripeHostedCheckoutUrl(url)) {
      throw new Error('Checkout did not return a valid Stripe URL');
    }

    console.log('🔷 Redirecting to Stripe checkout:', url);

    window.location.assign(url);
  } catch (err) {
    console.error('🔷 Checkout failed:', err);
    throw err;
  }
};

/** Tracker / library guild — recurring subscription — includes tracker premium + desktop app gift */
export const buyLibraryPremium = async (userId: string, userEmail: string) => {
  if (!STRIPE_PRICES.LIBRARY_PREMIUM) {
    throw new Error('Library Premium price not configured (use Stripe subscription price ID)');
  }

  const baseUrl = window.location.origin;

  await redirectToCheckout({
    priceId: STRIPE_PRICES.LIBRARY_PREMIUM,
    mode: 'subscription',
    successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=library_subscription`,
    cancelUrl: `${baseUrl}/`,
    customerEmail: userEmail,
    metadata: { userId, product: 'library_subscription', grants: 'library_subscription+desktop_app' },
  });
};

/** Library Pass — €2.50/mo subscription; mints admission card in inventory */
export const buyLibraryPass = buyLibraryPremium;

/** VIP flair — updates card overlay + role (not Super User) */
export const buyVipUpgrade = async (userId: string, userEmail: string) => {
  if (!STRIPE_PRICES.VIP_UPGRADE) {
    throw new Error('VIP upgrade price not configured');
  }
  const baseUrl = window.location.origin;
  await redirectToCheckout({
    priceId: STRIPE_PRICES.VIP_UPGRADE,
    mode: 'payment',
    successUrl: `${baseUrl}/app/membership?vip=1`,
    cancelUrl: `${baseUrl}/app/membership`,
    customerEmail: userEmail,
    metadata: { userId, product: 'vip_upgrade' },
  });
};

/** Program site — desktop app only (one-time) — does not unlock tracker library subscription */
export const buyProgramDownload = async (userId: string, userEmail: string) => {
  if (!STRIPE_PRICES.PROGRAM_DOWNLOAD) {
    throw new Error('Program Download price not configured');
  }

  const baseUrl = window.location.origin;

  await redirectToCheckout({
    priceId: STRIPE_PRICES.PROGRAM_DOWNLOAD,
    mode: 'payment',
    successUrl: `${baseUrl}/download-success?session_id={CHECKOUT_SESSION_ID}&type=program_download`,
    cancelUrl: `${baseUrl}/`,
    customerEmail: userEmail,
    metadata: { userId, product: 'program_download', grants: 'program_only' },
  });
};

// Blog: Subscribe Monthly
export const subscribeBlogMonthly = async (userId: string, userEmail: string) => {
  if (!STRIPE_PRICES.BLOG_SUBSCRIPTION_MONTHLY) {
    throw new Error('Blog Monthly Subscription price not configured');
  }

  const baseUrl = window.location.origin;
  
  await redirectToCheckout({
    priceId: STRIPE_PRICES.BLOG_SUBSCRIPTION_MONTHLY,
    mode: 'subscription',
    successUrl: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/`,
    customerEmail: userEmail,
    metadata: { userId, product: 'blog_subscription_monthly' },
  });
};

// Blog: Subscribe Yearly (optional)
export const subscribeBlogYearly = async (userId: string, userEmail: string) => {
  if (!STRIPE_PRICES.BLOG_SUBSCRIPTION_YEARLY) {
    throw new Error('Blog Yearly Subscription price not configured');
  }

  const baseUrl = window.location.origin;
  
  await redirectToCheckout({
    priceId: STRIPE_PRICES.BLOG_SUBSCRIPTION_YEARLY,
    mode: 'subscription',
    successUrl: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/`,
    customerEmail: userEmail,
    metadata: { userId, product: 'blog_subscription_yearly' },
  });
};

// Generic function for custom checkouts
export const createCustomCheckout = async (
  priceId: string,
  userId: string,
  userEmail: string,
  mode: 'payment' | 'subscription' = 'payment'
) => {
  const baseUrl = window.location.origin;
  
  await redirectToCheckout({
    priceId,
    mode,
    successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/`,
    customerEmail: userEmail,
    metadata: { userId },
  });
};
