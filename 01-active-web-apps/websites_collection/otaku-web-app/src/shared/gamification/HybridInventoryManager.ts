/**
 * Hybrid MMO + D&D inventory (snippet_hybrid_mmo_dnd_inventory).
 */

import type { ItemRarity } from './rarityTokens';

export type ActionType = 'Action' | 'BonusAction' | 'Reaction' | 'Free';
export type EquipSlot = 'MainHand' | 'OffHand' | 'Armor' | 'Ring1' | 'Ring2';

export interface HybridItem {
  id: string;
  name: string;
  rarity?: ItemRarity;
  isStackable: boolean;
  quantity: number;
  requiresAttunement: boolean;
  isAttuned: boolean;
  hasCharges: boolean;
  currentCharges: number;
  activationCost: ActionType;
  equipSlot?: EquipSlot;
}

export interface Character {
  id: string;
  attunementCap: number;
  currentAttunedCount: number;
  hasAction: boolean;
  hasBonusAction: boolean;
  inventory: Map<string, HybridItem>;
  equipped: Map<EquipSlot, HybridItem>;
}

export class HybridInventoryManager {
  constructor(private char: Character) {}

  getCharacter(): Character {
    return this.char;
  }

  equipItem(itemId: string, targetSlot: EquipSlot): string {
    const item = this.char.inventory.get(itemId);
    if (!item || item.equipSlot !== targetSlot) return 'Cannot equip this item here.';
    this.char.inventory.delete(itemId);
    this.char.equipped.set(targetSlot, item);
    return `Equipped ${item.name}.${item.requiresAttunement && !item.isAttuned ? ' (Requires attunement)' : ''}`;
  }

  attuneToEquipped(slot: EquipSlot): string {
    const item = this.char.equipped.get(slot);
    if (!item) return 'No item equipped in that slot.';
    if (!item.requiresAttunement) return 'Item does not require attunement.';
    if (item.isAttuned) return 'Already attuned.';
    if (this.char.currentAttunedCount >= this.char.attunementCap) return 'Attunement cap reached.';
    item.isAttuned = true;
    this.char.currentAttunedCount += 1;
    return `You bonded with ${item.name}.`;
  }

  useItemInCombat(itemId: string, source: 'inventory' | 'equipped'): string {
    let item: HybridItem | undefined;
    if (source === 'inventory') {
      item = this.char.inventory.get(itemId);
    } else {
      item = Array.from(this.char.equipped.values()).find((i) => i.id === itemId);
    }
    if (!item) return 'Item not found.';
    if (item.activationCost === 'Action' && !this.char.hasAction) return 'No Action available.';
    if (item.activationCost === 'BonusAction' && !this.char.hasBonusAction) return 'No Bonus Action available.';
    if (item.requiresAttunement && !item.isAttuned) return 'You must attune to use this item.';

    if (item.hasCharges) {
      if (item.currentCharges <= 0) return 'No charges left.';
      item.currentCharges -= 1;
    } else if (item.isStackable) {
      if (item.quantity <= 0) return 'Out of stock.';
      item.quantity -= 1;
      if (item.quantity === 0 && source === 'inventory') this.char.inventory.delete(itemId);
    }

    if (item.activationCost === 'Action') this.char.hasAction = false;
    if (item.activationCost === 'BonusAction') this.char.hasBonusAction = false;
    return `Used ${item.name}!`;
  }

  findByName(query: string): HybridItem | undefined {
    const q = query.toLowerCase();
    for (const item of this.char.inventory.values()) {
      if (item.name.toLowerCase().includes(q)) return item;
    }
    for (const item of this.char.equipped.values()) {
      if (item.name.toLowerCase().includes(q)) return item;
    }
    return undefined;
  }
}

export function createDemoCharacter(userId: string): Character {
  const inventory = new Map<string, HybridItem>([
    [
      'health_potion',
      {
        id: 'health_potion',
        name: 'Health Potion',
        rarity: 'common',
        isStackable: true,
        quantity: 3,
        requiresAttunement: false,
        isAttuned: false,
        hasCharges: false,
        currentCharges: 0,
        activationCost: 'BonusAction',
      },
    ],
    [
      'enchanted_ledger',
      {
        id: 'enchanted_ledger',
        name: 'Enchanted Ledger',
        rarity: 'epic',
        isStackable: false,
        quantity: 1,
        requiresAttunement: true,
        isAttuned: true,
        hasCharges: false,
        currentCharges: 0,
        activationCost: 'Action',
        equipSlot: 'OffHand',
      },
    ],
    [
      'star_wand',
      {
        id: 'star_wand',
        name: 'Star Wand',
        rarity: 'rare',
        isStackable: false,
        quantity: 1,
        requiresAttunement: true,
        isAttuned: false,
        hasCharges: true,
        currentCharges: 7,
        activationCost: 'Action',
        equipSlot: 'MainHand',
      },
    ],
  ]);

  return {
    id: userId,
    attunementCap: 3,
    currentAttunedCount: 1,
    hasAction: true,
    hasBonusAction: true,
    inventory,
    equipped: new Map(),
  };
}
