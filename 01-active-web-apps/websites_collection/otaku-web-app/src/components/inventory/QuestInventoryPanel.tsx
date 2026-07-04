'use client';

import { useState, useCallback } from 'react';
import { createDemoCharacter, type Character } from '@/shared/gamification/HybridInventoryManager';
import { QuestInventoryGrid } from '@/shared/components/inventory/QuestInventoryGrid';
import { useGamification } from '@/shared/gamification/GamificationContext';

type Props = {
  userId: string;
};

export function QuestInventoryPanel({ userId }: Props) {
  const { addXp } = useGamification();
  const [character, setCharacter] = useState<Character>(() => createDemoCharacter(userId));

  const onUseItem = useCallback(
    async (itemId: string) => {
      try {
        const res = await fetch('/api/inventory/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, userId }),
        });
        if (res.ok) {
          addXp(15, `Used ${itemId}`);
        }
        return res.ok;
      } catch {
        return false;
      }
    },
    [userId, addXp],
  );

  return (
    <QuestInventoryGrid
      character={character}
      onCharacterChange={setCharacter}
      onUseItem={onUseItem}
    />
  );
}
