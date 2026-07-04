-- Split library subscription vs desktop program access — NULL means "unset" (legacy tier rules apply).

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS library_subscription_active BOOLEAN;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS program_access BOOLEAN;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS program_license_key TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS purchase_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS program_standalone BOOLEAN;

COMMENT ON COLUMN user_profiles.program_standalone IS 'True if desktop app was purchased alone (keeps app when library sub ends)';

COMMENT ON COLUMN user_profiles.library_subscription_active IS 'Stripe library tier; NULL = use legacy tier field';
COMMENT ON COLUMN user_profiles.program_access IS 'Desktop app; NULL = use legacy tier unless library_subscription grants bundle';
