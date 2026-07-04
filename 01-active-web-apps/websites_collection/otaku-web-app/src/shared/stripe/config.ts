// Shared Stripe Configuration for All 3 Sites
// Add your Stripe credentials to .env.local in the ROOT of the project

import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Stripe publishable key from environment
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Stripe singleton
let stripePromise: Promise<Stripe | null> | null = null;

// Initialize Stripe (lazy loading)
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};

// Product Price IDs (from environment)
export const STRIPE_PRICES = {
  /** Recurring Stripe price for tracker / library guild (subscription mode checkout) */
  LIBRARY_PREMIUM: process.env.NEXT_PUBLIC_STRIPE_LIBRARY_PREMIUM_PRICE_ID,

  /** One-time desktop app SKU only (no tracker subscription) */
  PROGRAM_DOWNLOAD: process.env.NEXT_PUBLIC_STRIPE_PROGRAM_DOWNLOAD_PRICE_ID,
  
  // Blog: Monthly Subscription
  BLOG_SUBSCRIPTION_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_BLOG_MONTHLY_PRICE_ID,
  
  // Blog: Yearly Subscription (optional)
  BLOG_SUBSCRIPTION_YEARLY: process.env.NEXT_PUBLIC_STRIPE_BLOG_YEARLY_PRICE_ID,

  /** One-time VIP flair upgrade (not Super User — earn-only) */
  VIP_UPGRADE: process.env.NEXT_PUBLIC_STRIPE_VIP_UPGRADE_PRICE_ID,
};

// Helper to check if a specific product is configured
export const isProductConfigured = (productKey: keyof typeof STRIPE_PRICES): boolean => {
  return !!STRIPE_PRICES[productKey];
};
