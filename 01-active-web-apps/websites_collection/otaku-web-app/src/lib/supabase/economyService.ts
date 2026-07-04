import { supabase } from './config';
import type { GachaItem, UserGachaState } from '@/types';

export const economyService = {
  /**
   * Fetches the user's economy state, including dust, tickets, and account level.
   */
  async getUserEconomy(userId: string): Promise<UserGachaState | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users_economy')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    const inventory = await this.getUserInventory(userId);

    return {
      userId,
      accountLevel: data.account_level,
      pityModifier: 0, // Handled client/session side
      softPityCount: 0,
      guaranteedBannerItem: false,
      arcaneDust: data.arcane_dust,
      inventory: inventory,
    };
  },

  /**
   * Fetches the user's Gacha Inventory (Soul Bound and Standard).
   */
  async getUserInventory(userId: string): Promise<GachaItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('gacha_inventory')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];

    return data.map(item => ({
      id: item.id,
      name: item.item_name,
      rarity: item.rarity as any,
      itemLevel: item.item_level,
      attributes: item.attributes,
    }));
  },

  /**
   * Grants XP and handles auto-level up for the Account Level.
   */
  async grantXP(userId: string, amount: number) {
    if (!supabase) return;
    const { data: current, error: fetchError } = await supabase
      .from('users_economy')
      .select('xp, account_level')
      .eq('user_id', userId)
      .single();

    if (fetchError || !current) return;

    let newXp = current.xp + amount;
    let newLevel = current.account_level;
    const levelThreshold = newLevel * 100; // Linear/Exponential curve logic

    if (newXp >= levelThreshold) {
      newLevel += 1;
      newXp -= levelThreshold;
    }

    if (supabase) {
      await supabase
        .from('users_economy')
        .update({ xp: newXp, account_level: newLevel })
        .eq('user_id', userId);
    }
  },

  /**
   * Saves a newly minted Generative Loot item to the database.
   */
  async saveMintedItem(userId: string, item: GachaItem) {
    if (!supabase) throw new Error("Supabase is not initialized");
    return await supabase.from('gacha_inventory').insert({
      user_id: userId,
      item_name: item.name,
      item_level: item.itemLevel,
      rarity: item.rarity,
      attributes: item.attributes,
      is_soul_bound: false,
    });
  },

  /**
   * Deletes an item and adds Arcane Dust to the user's economy.
   */
  async crushItem(userId: string, itemId: string, dustReward: number) {
    if (!supabase) return;
    // 1. Delete item
    await supabase.from('gacha_inventory').delete().eq('id', itemId).eq('user_id', userId);

    // 2. Add Dust (Ideally this would be an RPC call for atomic increment)
    const { data: current } = await supabase
      .from('users_economy')
      .select('arcane_dust')
      .eq('user_id', userId)
      .single();

    if (current) {
      await supabase
        .from('users_economy')
        .update({ arcane_dust: current.arcane_dust + dustReward })
        .eq('user_id', userId);
    }
  },

  /**
   * Toggles the Soul Bound status of an item.
   */
  async toggleSoulBind(userId: string, itemId: string, isSoulBound: boolean) {
    if (!supabase) return;
    await supabase
      .from('gacha_inventory')
      .update({ is_soul_bound: isSoulBound })
      .eq('id', itemId)
      .eq('user_id', userId);
  },

  /**
   * Creates a marketplace listing for an item.
   */
  async listItemForSale(userId: string, itemId: string, askingPrice: number) {
    if (!supabase) throw new Error("Supabase is not initialized");
    // 1. Verify ownership and ensure not soul bound
    const { data: item } = await supabase
      .from('gacha_inventory')
      .select('is_soul_bound')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (!item || item.is_soul_bound) throw new Error("Cannot list this item");

    // 2. Create listing
    if (supabase) {
      await supabase.from('marketplace_listings').insert({
        seller_id: userId,
        inventory_item_id: itemId,
        asking_price: askingPrice,
        status: 'active'
      });
    }
  },

  /**
   * Purchases an item from the marketplace using Soul Gems.
   */
  async buyMarketplaceItem(buyerId: string, listingId: string) {
    // This requires atomic transactions (RPC) in production. Here is the logical flow:
    if (!supabase) throw new Error("Supabase is not initialized");
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (!listing) throw new Error("Listing not found or inactive");

    // Deduct gems from buyer, add to seller, transfer item ownership, mark listing 'sold'
    // For now, this is a placeholder for a secure Supabase RPC call that handles the SQL transaction.
    console.log(`[Marketplace] Buyer ${buyerId} buying item ${listing.inventory_item_id} from ${listing.seller_id} for ${listing.asking_price} gems.`);
  },

  /**
   * Redeems Soul Gems for 30 days of VIP status (Play-to-Sustain logic).
   */
  async redeemVIP(userId: string) {
    const VIP_COST = 500; // Example cost

    if (!supabase) throw new Error("Supabase is not initialized");
    const { data: userEco } = await supabase
      .from('users_economy')
      .select('soul_gems')
      .eq('user_id', userId)
      .single();

    if (userEco && userEco.soul_gems >= VIP_COST) {
      if (supabase) {
        await supabase
          .from('users_economy')
          .update({
            soul_gems: userEco.soul_gems - VIP_COST,
            tier: 'vip' // Also would need to update expiration dates in a real sub system
          })
          .eq('user_id', userId);
      }
    } else {
      throw new Error("Not enough Soul Gems");
    }
  }
};
