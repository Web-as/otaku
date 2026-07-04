/**
 * Fuzzy text → strict intent parser (RESEARCH_TEXT_COMMANDS / MASTER_ARCHITECTURE_2026 §4).
 */

export type CommandAction = 'USE' | 'EQUIP' | 'DROP' | 'ATTUNE' | 'INSPECT' | 'UNKNOWN';

export interface ParsedIntent {
  action: CommandAction;
  targetItemName: string;
  targetSlot?: 'MainHand' | 'OffHand';
}

const VERB_MAP: Record<string, CommandAction> = {
  use: 'USE',
  drink: 'USE',
  eat: 'USE',
  consume: 'USE',
  quaff: 'USE',
  equip: 'EQUIP',
  wield: 'EQUIP',
  wear: 'EQUIP',
  hold: 'EQUIP',
  drop: 'DROP',
  throw: 'DROP',
  discard: 'DROP',
  attune: 'ATTUNE',
  bond: 'ATTUNE',
  inspect: 'INSPECT',
  examine: 'INSPECT',
  check: 'INSPECT',
};

const NOISE = new Set(['the', 'my', 'a', 'an', 'to', 'with', 'please', 'quickly', 'some']);

export class TextCommandEngine {
  parseInput(rawInput: string): ParsedIntent {
    const clean = rawInput.toLowerCase().trim().replace(/^\//, '');
    const tokens = clean.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return { action: 'UNKNOWN', targetItemName: '' };
    }

    const action = VERB_MAP[tokens[0]!] ?? 'UNKNOWN';
    const rest = tokens.slice(1).filter((w) => !NOISE.has(w));

    let targetSlot: ParsedIntent['targetSlot'];
    if (rest.includes('main')) targetSlot = 'MainHand';
    if (rest.includes('off')) targetSlot = 'OffHand';

    const itemTokens = rest.filter((w) => w !== 'main' && w !== 'off' && w !== 'hand');

    return {
      action,
      targetItemName: itemTokens.join(' '),
      targetSlot,
    };
  }

  /** Fuzzy match item name against inventory keys */
  findItemByName<T extends { name: string; id: string }>(
    query: string,
    items: T[],
  ): T | undefined {
    if (!query.trim()) return undefined;
    const q = query.toLowerCase();
    return (
      items.find((i) => i.name.toLowerCase() === q) ??
      items.find((i) => i.name.toLowerCase().includes(q)) ??
      items.find((i) => q.split(' ').every((w) => i.name.toLowerCase().includes(w)))
    );
  }

  executeHint(intent: ParsedIntent): string {
    if (intent.action === 'UNKNOWN') {
      return "Try: use potion, equip sword, inspect ledger";
    }
    if (!intent.targetItemName) {
      return `What do you want to ${intent.action.toLowerCase()}?`;
    }
    return '';
  }
}

export const textCommandEngine = new TextCommandEngine();
