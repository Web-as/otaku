// Product Key Generation for €1 Program Purchase

/**
 * Generate a unique product key
 * Format: OTAKU-XXXX-XXXX-XXXX
 */
export const generateProductKey = (): string => {
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
    segments.push(segment);
  }
  
  return `OTAKU-${segments.join('-')}`;
};

/**
 * Generate purchase details for user
 */
export interface PurchaseDetails {
  productKey: string;
  purchaseDate: string;
  productName: string;
  version: string;
  downloadUrl: string;
  tier: 'premium';
}

export const createPurchaseDetails = (): PurchaseDetails => {
  return {
    productKey: generateProductKey(),
    purchaseDate: new Date().toISOString(),
    productName: 'Library of Otaku - Desktop Program',
    version: 'v1.0.0-BETA',
    downloadUrl: '#', // Will be replaced with actual download
    tier: 'premium',
  };
};

/**
 * Save purchase to localStorage
 */
export const savePurchase = (
  details: PurchaseDetails,
  opts?: { setLibraryTierCache?: boolean },
): void => {
  localStorage.setItem('purchaseDetails', JSON.stringify(details));
  localStorage.setItem('purchaseDate', details.purchaseDate);
  localStorage.setItem('productKey', details.productKey);
  /** Tracker library tier is not the same as desktop program — default false */
  if (opts?.setLibraryTierCache === true) {
    localStorage.setItem('userTier', 'premium');
  }
};

/**
 * Get purchase details from localStorage
 */
export const getPurchaseDetails = (): PurchaseDetails | null => {
  const stored = localStorage.getItem('purchaseDetails');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Check if user has purchased
 */
export const hasPurchased = (): boolean => {
  return localStorage.getItem('userTier') === 'premium';
};
