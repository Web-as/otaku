-- Membership ladder + interactive inventory (Library Admission Card)

-- Profile extensions
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'guest'
    CHECK (role IN ('guest', 'user', 'vip', 'early_access', 'op', 'super_user')),
  ADD COLUMN IF NOT EXISTS membership_stage TEXT NOT NULL DEFAULT 'guest'
    CHECK (membership_stage IN ('guest', 'pass_holder', 'app_owner', 'vip', 'super_user')),
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS super_user_eligible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS library_career JSONB NOT NULL DEFAULT '{"series_logged":0,"milestones_unlocked":[]}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_user_profiles_membership_stage ON user_profiles(membership_stage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Item catalog
CREATE TABLE IF NOT EXISTS item_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  item_type TEXT NOT NULL CHECK (item_type IN ('consumable', 'key', 'cosmetic', 'upgrade_token')),
  purpose TEXT NOT NULL CHECK (purpose IN ('access_key', 'renewal', 'upgrade', 'display')),
  interact_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  grants JSONB NOT NULL DEFAULT '{}'::jsonb,
  shop_price_id TEXT,
  renewal_interval TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User inventory instances
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES item_catalog(id) ON DELETE RESTRICT,
  state TEXT NOT NULL DEFAULT 'active'
    CHECK (state IN ('active', 'expired', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_state ON user_inventory(user_id, state);

ALTER TABLE item_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read item catalog"
  ON item_catalog FOR SELECT USING (true);

CREATE POLICY "Users read own inventory"
  ON user_inventory FOR SELECT USING (auth.uid() = user_id);

-- Writes via service role (backend webhook / API)

INSERT INTO item_catalog (slug, name, description, item_type, purpose, interact_actions, grants)
VALUES
  (
    'library_admission_card',
    'Library Admission Card',
    'Your key to the member library. Renew monthly, cancel anytime, upgrade for VIP flair.',
    'key',
    'access_key',
    '["view","renew","cancel","use_key","upgrade_vip"]'::jsonb,
    '{"unlock_routes":["/app/library","/app/scanner","/app/quests"],"membership_stage":"pass_holder"}'::jsonb
  ),
  (
    'vip_flair_upgrade',
    'VIP Library Flair',
    'Prestige upgrade for your admission card — unlocks VIP role and badge.',
    'upgrade_token',
    'upgrade',
    '["view","apply"]'::jsonb,
    '{"role":"vip","membership_stage":"vip","card_overlay":"vip"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  interact_actions = EXCLUDED.interact_actions,
  grants = EXCLUDED.grants;
