-- Supabase Migration: User Inventory for XR & Gamification
-- This table handles secure real-time inventory drops and XR AR/VR asset data.

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT DEFAULT 'item',
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  asset_type TEXT DEFAULT '2D' CHECK (asset_type IN ('2D', '3D_XR')),
  model_glb_url TEXT,
  model_usdz_url TEXT,
  image_url TEXT,
  xr_scale NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);

-- Hardcore Security: Row Level Security (RLS)
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- 1. Read Access: Users can ONLY view their own inventory
CREATE POLICY "Users can view own inventory"
  ON public.user_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Strictly NO Client-Side Inserts/Updates/Deletes
-- The lack of INSERT, UPDATE, and DELETE policies means that 
-- standard Supabase client calls from the frontend CANNOT modify this table.
-- Drops and item usage must be verified and processed by the backend (Service Role key)
-- to prevent cheating or item injection.

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_updated_at
BEFORE UPDATE ON public.user_inventory
FOR EACH ROW
EXECUTE FUNCTION update_inventory_updated_at();
