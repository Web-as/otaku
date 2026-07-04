-- 002_roles_economy.sql

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'user');
CREATE TYPE user_tier AS ENUM ('free', 'super', 'super_premium', 'subscriber', 'vip', 'ascendant');

-- 2. USERS ECONOMY & ROLES
CREATE TABLE IF NOT EXISTS public.users_economy (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'user' NOT NULL,
    tier user_tier DEFAULT 'free' NOT NULL,
    account_level INTEGER DEFAULT 1 NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    arcane_dust INTEGER DEFAULT 0 NOT NULL,
    soul_gems INTEGER DEFAULT 0 NOT NULL, -- Premium Currency for Marketplace
    vip_tickets INTEGER DEFAULT 0 NOT NULL,
    inventory_expansion_purchased BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for economy
ALTER TABLE public.users_economy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own economy" ON public.users_economy FOR SELECT USING (auth.uid() = user_id);
-- Admin/Staff overrides can be handled by Supabase Service Role or specific admin RLS policies.

-- 2.5 MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID NOT NULL, -- Logical reference to gacha_inventory (cannot hard FK easily if item ownership transfers)
    asking_price INTEGER NOT NULL, -- Price in Soul Gems
    status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'sold', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create their own listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can cancel their own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);

-- 3. GACHA INVENTORY
CREATE TABLE IF NOT EXISTS public.gacha_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    item_level INTEGER NOT NULL,
    rarity TEXT NOT NULL, -- e.g., 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'
    attributes JSONB DEFAULT '{}'::jsonb NOT NULL, -- The D&D stats
    is_soul_bound BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for inventory
ALTER TABLE public.gacha_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own inventory" ON public.gacha_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own inventory" ON public.gacha_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory (soul bind)" ON public.gacha_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory (crush)" ON public.gacha_inventory FOR DELETE USING (auth.uid() = user_id);

-- 4. MAILBOX (VIP Tickets, Rewards)
CREATE TABLE IF NOT EXISTS public.mailbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT DEFAULT 'System' NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    attached_dust INTEGER DEFAULT 0,
    attached_vip_tickets INTEGER DEFAULT 0,
    is_claimed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for mailbox
ALTER TABLE public.mailbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mail" ON public.mailbox FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim their own mail" ON public.mailbox FOR UPDATE USING (auth.uid() = user_id);

-- 5. TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_economy_modtime
    BEFORE UPDATE ON public.users_economy
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Admin setup helper
CREATE OR REPLACE FUNCTION set_admin(target_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.users_economy
    SET role = 'admin', tier = 'ascendant'
    FROM auth.users
    WHERE auth.users.id = users_economy.user_id
    AND auth.users.email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
