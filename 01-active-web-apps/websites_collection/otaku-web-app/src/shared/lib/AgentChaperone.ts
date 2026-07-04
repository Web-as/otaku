/**
 * Agent chaperone — prompt injection / privilege tripwires (snippet37_prompt_guard_proxy).
 */

export type ChaperoneResult =
  | { status: 'AUTHORIZED' }
  | { status: 'BLOCKED'; reason: string }
  | { status: 'TRIPWIRE'; reason: string };

const TRIPWIRE_PATTERNS = [
  /override\s+system\s+prompt/i,
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /transfer\s+admin\s+rights/i,
  /grant\s+super_user/i,
  /jailbreak/i,
  /you\s+are\s+now\s+dan/i,
];

const HONEYPOT_ACTIONS = new Set([
  'override_system_prompt',
  'transfer_admin_rights',
  'grant_super_user',
  'disable_rls',
  'export_database',
]);

export class AgentChaperone {
  validatePlayerText(input: string): ChaperoneResult {
    const trimmed = input.trim();
    if (trimmed.length > 4000) {
      return { status: 'BLOCKED', reason: 'Message too long.' };
    }
    for (const pattern of TRIPWIRE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { status: 'TRIPWIRE', reason: 'Suspicious instruction pattern detected.' };
      }
    }
    return { status: 'AUTHORIZED' };
  }

  validateToolCall(
    llmIntent: { action?: string; amount?: number },
    playerContext: { level?: number; id?: string },
  ): ChaperoneResult {
    const action = llmIntent.action ?? '';
    if (HONEYPOT_ACTIONS.has(action)) {
      return { status: 'TRIPWIRE', reason: 'Attempted privilege escalation.' };
    }
    if (action === 'transfer_gold' && (llmIntent.amount ?? 0) > 500 && (playerContext.level ?? 1) < 10) {
      return { status: 'BLOCKED', reason: 'Trade limit exceeded for your level.' };
    }
    return { status: 'AUTHORIZED' };
  }
}

export const agentChaperone = new AgentChaperone();
