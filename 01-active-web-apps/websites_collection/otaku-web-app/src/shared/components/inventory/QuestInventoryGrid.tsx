'use client';

/**
 * Optimistic quest inventory grid (snippet27_react_19_use_optimistic_inventory).
 */
import { useOptimistic, useTransition, useMemo, useState, type FormEvent } from 'react';
import type { HybridItem, Character } from '../../gamification/HybridInventoryManager';
import { HybridInventoryManager } from '../../gamification/HybridInventoryManager';
import { textCommandEngine } from '../../lib/TextCommandEngine';
import { RARITY_TAILWIND, normalizeRarity } from '../../gamification/rarityTokens';

type Props = {
  character: Character;
  onCharacterChange?: (char: Character) => void;
  onUseItem?: (itemId: string) => Promise<boolean>;
};

export function QuestInventoryGrid({ character, onCharacterChange, onUseItem }: Props) {
  const [manager] = useState(() => new HybridInventoryManager(character));
  const [log, setLog] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [isPending, startTransition] = useTransition();

  const items = useMemo(() => Array.from(character.inventory.values()), [character]);

  const [optimisticItems, applyOptimistic] = useOptimistic(items, (state, itemId: string) =>
    state
      .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0),
  );

  const handleUse = (item: HybridItem) => {
    startTransition(async () => {
      applyOptimistic(item.id);
      const msg = manager.useItemInCombat(item.id, 'inventory');
      setLog((prev) => [msg, ...prev].slice(0, 5));
      onCharacterChange?.(manager.getCharacter());
      if (onUseItem) {
        const ok = await onUseItem(item.id);
        if (!ok) setLog((prev) => [`Sync failed for ${item.name}`, ...prev].slice(0, 5));
      }
    });
  };

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    const intent = textCommandEngine.parseInput(command);
    const hint = textCommandEngine.executeHint(intent);
    if (hint) {
      setLog((prev) => [hint, ...prev].slice(0, 5));
      return;
    }
    const target = manager.findByName(intent.targetItemName);
    if (target && intent.action === 'USE') {
      handleUse(target);
    } else {
      setLog((prev) => [`No item matching "${intent.targetItemName}"`, ...prev].slice(0, 5));
    }
    setCommand('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCommand} className="flex gap-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='Try "use health potion" or /use potion'
          className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white anime-focus-ring"
        />
        <button type="submit" className="theme-cta-secondary px-4 text-sm font-bold">
          Run
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {optimisticItems.map((item) => {
          const r = normalizeRarity(item.rarity ?? 'common');
          const tw = RARITY_TAILWIND[r];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleUse(item)}
              disabled={isPending}
              className={`theme-rarity-slot theme-card p-4 text-left transition-all hover:scale-[1.02] disabled:opacity-50 ${tw.border}`}
              style={{
                ['--rarity-border' as string]: tw.border.includes('gray') ? '#6b7280' : undefined,
              }}
            >
              <div className={`text-[10px] uppercase font-black mb-1 ${tw.text}`}>{r}</div>
              <div className="font-bold text-sm text-white truncate">{item.name}</div>
              <div className="text-xs text-zinc-400 mt-1">
                Qty {item.quantity}
                {item.hasCharges ? ` · ${item.currentCharges} ch` : ''}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">{item.activationCost}</div>
            </button>
          );
        })}
      </div>

      {isPending && (
        <p className="text-xs text-zinc-500 animate-pulse text-center">Syncing with dungeon inventory…</p>
      )}

      {log.length > 0 && (
        <div className="hud-panel p-3 text-xs font-mono text-zinc-300 space-y-1">
          {log.map((line, i) => (
            <div key={i} className="text-[var(--anime-cyan)]">
              › {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
