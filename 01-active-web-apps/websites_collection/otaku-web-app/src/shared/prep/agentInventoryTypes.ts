/**
 * Agent inventory types — prep layer for RESEARCH_AI_AGENT_INVENTORY / snippet_ai_agent_inventory.
 * Wire into unified-new AgentRegistry and otaku-gildija-lt AIAssistant chaperone flows.
 */

export interface AgentItem {
  id: string;
  name: string;
  description: string;
  toolToTrigger: string;
}

export type AgentToolResult =
  | { ok: true; message: string }
  | { ok: false; code: 'MISSING_ITEM' | 'BROKEN_ITEM' | 'TOOL_ERROR'; message: string };

export interface AgenticEntitySnapshot {
  name: string;
  role: string;
  inventoryIds: string[];
}

export function agentMissingItemMessage(itemName: string): string {
  return `[TOOL_EXECUTION_FAILED]: You attempted to use '${itemName}', but it is missing from your inventory. Roleplay your reaction to the player.`;
}

export function findAgentItemByName(
  inventory: Map<string, AgentItem>,
  itemName: string,
): AgentItem | undefined {
  const q = itemName.toLowerCase();
  for (const item of inventory.values()) {
    if (item.name.toLowerCase() === q || item.name.toLowerCase().includes(q)) {
      return item;
    }
  }
  return undefined;
}

export function snapshotAgent(entity: {
  name: string;
  role: string;
  inventory: Map<string, AgentItem>;
}): AgenticEntitySnapshot {
  return {
    name: entity.name,
    role: entity.role,
    inventoryIds: Array.from(entity.inventory.keys()),
  };
}
