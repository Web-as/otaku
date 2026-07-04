import React from 'react';

export interface EquipmentSlot {
  type: 'head' | 'chest' | 'legs' | 'weapon' | 'artifact';
  itemId?: string;
  itemName?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
}

interface InventoryPaperdollProps {
  slots: EquipmentSlot[];
}

export function InventoryPaperdoll({ slots }: InventoryPaperdollProps) {
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'border-amber-400 shadow-glow-magenta';
      case 'epic': return 'border-brand-magenta-neon shadow-glow-magenta';
      case 'rare': return 'border-brand-cyan-neon shadow-glow-cyan';
      case 'uncommon': return 'border-emerald-400';
      default: return 'border-dark-border';
    }
  };

  const getSlot = (type: string) => slots.find(s => s.type === type);

  const SlotComponent = ({ type }: { type: 'head' | 'chest' | 'legs' | 'weapon' | 'artifact' }) => {
    const slot = getSlot(type);
    const hasItem = !!slot?.itemId;

    return (
      <div 
        className={`
          w-16 h-16 md:w-20 md:h-20 bg-dark-bgSecondary inked-outline rounded-sm flex items-center justify-center relative
          ${hasItem ? getRarityColor(slot.rarity) : 'border-dashed border-gray-600'}
        `}
      >
        {hasItem ? (
          <img 
            src={slot.imageUrl || `https://placehold.co/100x100/0a0a0c/00f0ff?text=${type}`} 
            alt={slot.itemName} 
            className="w-full h-full object-cover p-1"
          />
        ) : (
          <span className="text-xs text-gray-500 uppercase">{type}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 glass-panel inked-outline max-w-sm mx-auto">
      <h3 className="font-display font-bold text-xl text-brand-cyan-neon tracking-widest">EQUIPMENT</h3>
      
      <div className="grid grid-cols-3 gap-4 place-items-center w-full relative">
        {/* Abstract background character silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-24 h-48 border border-brand-cyan-neon rounded-full" />
        </div>

        {/* Top Row: Head */}
        <div className="col-start-2">
          <SlotComponent type="head" />
        </div>

        {/* Middle Row: Weapon, Chest, Artifact */}
        <div className="col-start-1">
          <SlotComponent type="weapon" />
        </div>
        <div className="col-start-2">
          <SlotComponent type="chest" />
        </div>
        <div className="col-start-3">
          <SlotComponent type="artifact" />
        </div>

        {/* Bottom Row: Legs */}
        <div className="col-start-2">
          <SlotComponent type="legs" />
        </div>
      </div>
      
      <div className="w-full mt-4 p-4 bg-dark-bg border border-dark-border rounded-sm text-sm text-gray-300">
        <p>Stats Bonus:</p>
        <p className="text-brand-cyan-neon">+12 INT (Arcane Parser Boost)</p>
        <p className="text-brand-magenta-neon">+5 CHR (VN Dialogue Advantage)</p>
      </div>
    </div>
  );
}
