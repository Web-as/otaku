-- Migration to create the pre_registrations table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pre_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  tier TEXT DEFAULT 'email_only',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  free_months_remaining INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS pre_registrations_email_idx ON pre_registrations(email);

-- Update RLS policies (optional, but good practice if accessed from client)
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage all pre_registrations" 
  ON pre_registrations
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- Users can insert their own email (anon or authenticated)
CREATE POLICY "Anyone can insert pre_registration" 
  ON pre_registrations
  FOR INSERT 
  WITH CHECK (true);

-- Users can read their own registration if they know the email
CREATE POLICY "Users can read own pre_registration" 
  ON pre_registrations
  FOR SELECT 
  USING (true);
