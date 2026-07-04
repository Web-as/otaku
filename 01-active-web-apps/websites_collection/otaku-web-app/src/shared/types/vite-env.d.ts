/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;

  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Stripe
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;

  // Cross-site URLs
  readonly VITE_BLOG_URL: string;
  readonly VITE_TRACKER_URL: string;
  readonly VITE_SALES_URL: string;
  readonly VITE_LOGIN_URL: string;
  readonly VITE_HOME_URL: string;

  // Mode
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
