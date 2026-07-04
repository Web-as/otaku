// Environment Variable Validator

export interface EnvConfig {
  // Firebase
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;

  // Supabase
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;

  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY?: string;

  // Cross-site URLs
  VITE_BLOG_URL?: string;
  VITE_TRACKER_URL?: string;
  VITE_SALES_URL?: string;
  VITE_LOGIN_URL?: string;
  VITE_HOME_URL?: string;
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  configured: {
    firebase: boolean;
    supabase: boolean;
    stripe: boolean;
    crossSite: boolean;
  };
}

/**
 * Validates all environment variables
 */
export const validateEnvironment = (): ValidationResult => {
  const env = import.meta.env as EnvConfig;
  const missing: string[] = [];
  const warnings: string[] = [];

  // Firebase validation
  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const firebaseMissing = firebaseVars.filter(v => !env[v as keyof EnvConfig]);
  if (firebaseMissing.length > 0) {
    warnings.push(`Firebase not configured: ${firebaseMissing.join(', ')}`);
  }

  // Supabase validation
  const supabaseVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const supabaseMissing = supabaseVars.filter(v => !env[v as keyof EnvConfig]);
  if (supabaseMissing.length > 0) {
    warnings.push(`Supabase not configured: ${supabaseMissing.join(', ')}`);
  }

  // Stripe validation
  if (!env.VITE_STRIPE_PUBLISHABLE_KEY) {
    warnings.push('Stripe not configured: VITE_STRIPE_PUBLISHABLE_KEY');
  }

  // Cross-site URLs (optional but recommended)
  const crossSiteVars = [
    'VITE_BLOG_URL',
    'VITE_TRACKER_URL',
    'VITE_SALES_URL',
    'VITE_LOGIN_URL',
    'VITE_HOME_URL',
  ];
  const crossSiteMissing = crossSiteVars.filter(v => !env[v as keyof EnvConfig]);
  if (crossSiteMissing.length > 0) {
    warnings.push(`Cross-site URLs not configured (using defaults): ${crossSiteMissing.join(', ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    configured: {
      firebase: firebaseMissing.length === 0,
      supabase: supabaseMissing.length === 0,
      stripe: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
      crossSite: crossSiteMissing.length === 0,
    },
  };
};

/**
 * Logs environment validation results
 */
export const logEnvironmentStatus = () => {
  const result = validateEnvironment();

  console.group('🔧 Environment Configuration');
  
  console.log('Firebase:', result.configured.firebase ? '✅ Configured' : '⚠️ Not configured');
  console.log('Supabase:', result.configured.supabase ? '✅ Configured' : '⚠️ Not configured');
  console.log('Stripe:', result.configured.stripe ? '✅ Configured' : '⚠️ Not configured');
  console.log('Cross-site URLs:', result.configured.crossSite ? '✅ Configured' : '⚠️ Using defaults');

  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    result.warnings.forEach(w => console.warn(w));
    console.groupEnd();
  }

  if (result.missing.length > 0) {
    console.group('❌ Missing Required Variables:');
    result.missing.forEach(m => console.error(m));
    console.groupEnd();
  }

  console.groupEnd();

  return result;
};

/**
 * Get safe environment value with fallback
 */
export const getEnvVar = (key: keyof EnvConfig, fallback: string = ''): string => {
  return (import.meta.env[key] as string) || fallback;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

// Auto-validate on import in development
if (isDevelopment()) {
  logEnvironmentStatus();
}

export default validateEnvironment;
