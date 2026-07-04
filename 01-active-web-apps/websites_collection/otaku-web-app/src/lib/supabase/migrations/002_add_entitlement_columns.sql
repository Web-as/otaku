-- Add entitlement columns to user_profiles
-- This migration adds the missing columns needed for proper payment tracking

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS program_license_key TEXT,
ADD COLUMN IF NOT EXISTS purchase_type TEXT CHECK (purchase_type IN ('library_premium', 'program_download', 'subscription', 'lifetime')),
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Index for license key lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_license_key ON user_profiles(program_license_key);

-- Index for Stripe customer ID lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);

-- Comments for documentation
COMMENT ON COLUMN user_profiles.program_license_key IS 'Unique license key for desktop program access';
COMMENT ON COLUMN user_profiles.purchase_type IS 'Type of purchase made by user';
COMMENT ON COLUMN user_profiles.purchase_date IS 'Date when user made their purchase';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID for payment reconciliation';
COMMENT ON COLUMN user_profiles.stripe_checkout_session_id IS 'Last Stripe checkout session ID';
COMMENT ON COLUMN user_profiles.stripe_payment_intent_id IS 'Stripe payment intent ID';
COMMENT ON COLUMN user_profiles.subscription_end_date IS 'End date for subscription-based purchases';
