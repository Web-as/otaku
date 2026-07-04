/**
 * Integration status manifest — docs/research → websites wiring.
 * Update `status` as each item lands in production code.
 */

export type PrepStatus = 'done' | 'partial' | 'prepped' | 'planned';

export type IntegrationItem = {
  id: string;
  status: PrepStatus;
  doc?: string;
  research?: string;
  snippet?: string;
  prepModule?: string;
  target: string;
  notes?: string;
};

export const INTEGRATION_MANIFEST: IntegrationItem[] = [
  {
    id: 'firebase-auth',
    status: 'done',
    doc: 'documentation/websites_theory/firebase_auth_theory.md',
    snippet: 'code_snippets/websites/snippet_websites_firebase_auth.ts',
    target: 'websites/shared/firebase/',
  },
  {
    id: 'stripe-entitlements',
    status: 'done',
    doc: 'documentation/websites_theory/stripe_payments_theory.md',
    snippet: 'code_snippets/websites/snippet_websites_stripe_checkout.ts',
    target: 'websites/shared/stripe/, websites/backend/',
  },
  {
    id: 'hybrid-inventory',
    status: 'partial',
    doc: 'documentation/MASTER_ARCHITECTURE_2026.md §3',
    research: 'advanced_research/RESEARCH_HYBRID_MMO_DND_INVENTORY.md',
    snippet: 'code_snippets/snippet_hybrid_mmo_dnd_inventory.ts',
    prepModule: 'websites/shared/gamification/HybridInventoryManager.ts',
    target: 'otaku-web-app inventory, unified-new /play',
    notes: 'MUD parser + sidebar synced; VN path needs end-to-end verify',
  },
  {
    id: 'text-command-parser',
    status: 'partial',
    doc: 'documentation/MASTER_ARCHITECTURE_2026.md §4',
    research: 'advanced_research/RESEARCH_TEXT_COMMANDS.md',
    prepModule: 'websites/shared/lib/TextCommandEngine.ts',
    target: 'VnPlayClient, unified-new play API',
  },
  {
    id: 'agent-inventory',
    status: 'partial',
    doc: 'documentation/MASTER_ARCHITECTURE_2026.md §5',
    research: 'advanced_research/RESEARCH_AI_AGENT_INVENTORY.md',
    snippet: 'code_snippets/01_ai_agents/snippet_ai_agent_inventory.ts',
    prepModule: 'websites/shared/prep/agentInventoryTypes.ts',
    target: 'unified-new play/command, otaku-gildija-lt AIAssistant',
  },
  {
    id: 'drizzle-cqrs',
    status: 'partial',
    doc: 'documentation/websites_theory/drizzle_event_sourcing_theory.md',
    snippet: 'code_snippets/websites/snippet_websites_drizzle_schema.ts',
    prepModule: 'websites/backend/workers/gamification-cqrs-worker.mjs',
    target: 'otaku-web-app/src/db/, npm run db:push',
    notes: 'Sync writes today; async worker prepped',
  },
  {
    id: 'safe-actions',
    status: 'prepped',
    doc: 'documentation/ultimate_code_improvements/BLUEPRINT_WEBSITES.md P2',
    snippet: 'code_snippets/03_web_frontend/snippet_nextjs_safe_action.ts',
    prepModule: 'otaku-web-app/src/lib/prep/awardGamification.server.ts',
    target: 'Replace /api/gamification/award route',
  },
  {
    id: 'rsc-queries',
    status: 'prepped',
    doc: 'documentation/ultimate_code_improvements/BLUEPRINT_WEBSITES.md P1',
    snippet: 'code_snippets/03_web_frontend/snippet_rsc_direct_query.tsx',
    prepModule: 'otaku-web-app/src/lib/prep/gamificationStats.server.ts',
    target: 'Leaderboard, membership stats pages',
  },
  {
    id: 'crdt-yjs',
    status: 'prepped',
    doc: 'documentation/websites_theory/yjs_crdt_realtime_theory.md',
    research: 'advanced_research/advancements/ADV_05_CRDT_P2P_Gaming.md',
    snippet: 'code_snippets/websites/snippet_websites_crdt_provider.ts',
    prepModule: 'websites/shared/prep/crdtConfig.ts',
    target: 'unified-new/apps/web/src/sync/crdtProvider.ts',
    notes: 'Replace wss://demos.yjs.dev with env URL',
  },
  {
    id: 'orama-search',
    status: 'partial',
    doc: 'documentation/websites_theory/librarian_bot_theory.md',
    research: 'advanced_research/advancements/ADV_20_Local_IndexedDB_Vector_Search.md',
    snippet: 'code_snippets/05_infra_security/snippet36_orama_local_vector_db.ts',
    prepModule: 'websites/shared/prep/oramaLoreIndex.ts, otaku-web-app/src/lib/gazetteOrama.ts',
    target: 'Community gazette (Orama text), library (mediaOramaIndex prep)',
  },
  {
    id: 'checkout-xstate',
    status: 'partial',
    doc: 'advanced_research/advancements/ADV_07_XState_LangGraph_Hybrid.md',
    snippet: 'code_snippets/01_ai_agents/snippet23_xstate_langgraph_hybrid.ts',
    prepModule: 'websites/shared/lib/checkoutStateMachine.ts + prep/checkoutFsmFull.ts',
    target: 'otaku-gildija-lt CheckoutModal',
    notes: 'Lite FSM wired; full XState + LangGraph optional',
  },
  {
    id: 'dual-db-tauri',
    status: 'prepped',
    doc: 'documentation/MASTER_ARCHITECTURE_2026.md §1',
    snippet: 'code_snippets/05_infra_security/snippet_drizzle_schema_dual.ts',
    prepModule: 'websites/shared/prep/dualDbMode.ts',
    target: 'otaku-web-app Tauri build + src/db/schema.ts',
  },
  {
    id: 'librarian-scout',
    status: 'done',
    doc: 'documentation/websites_theory/librarian_bot_theory.md',
    snippet: 'code_snippets/websites/snippet_websites_librarian_scout.ts',
    target: 'websites/shared/librarian/, CommunityHub, LibraryCatalog',
  },
  {
    id: 'guild-room-3d',
    status: 'done',
    doc: 'documentation/websites_theory/vn_graphics_theory.md',
    snippet: 'code_snippets/websites/snippet_websites_guild_room_3d.tsx',
    target: 'otaku-web-app AppLayout GuildRoom3D',
  },
  {
    id: 'monorepo-workspaces',
    status: 'planned',
    doc: 'documentation/websites_theory/websites_monorepo_theory.md',
    target: 'websites/package.json workspaces list',
    notes: 'Stale paths; add otaku-web-app, backend, hostinger-*',
  },
  {
    id: 'langgraph-agents',
    status: 'planned',
    research: 'advanced_research/RESEARCH_AI_AGENTS_AND_A2A.md',
    snippet: 'code_snippets/01_ai_agents/snippet_langgraph_advanced_workflow.ts',
    target: 'NEXUS-7 / VN DM orchestration',
  },
  {
    id: 'webgpu-ui',
    status: 'partial',
    research: 'advanced_research/advancements/ADV_01_Futuristic_Web_Dev.md',
    snippet: 'code_snippets/03_web_frontend/snippet51_neural_rendering_webgpu.ts',
    target: 'GachaWarpBanner (WebGPU aurora phase 1 done)',
  },
];

export function manifestByStatus(status: PrepStatus): IntegrationItem[] {
  return INTEGRATION_MANIFEST.filter((i) => i.status === status);
}

export function manifestSummary(): Record<PrepStatus, number> {
  return INTEGRATION_MANIFEST.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<PrepStatus, number>,
  );
}
