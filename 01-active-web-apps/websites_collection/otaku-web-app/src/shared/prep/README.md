# Integration prep — documentation → websites

This folder holds **adaptation-ready modules** extracted from `documentation/`, `advanced_research/`, and `code_snippets/`. They are not fully wired; they follow `websites/shared` conventions so apps can import them incrementally.

## How to use

1. Read [`INTEGRATION_PREP_INDEX.md`](../INTEGRATION_PREP_INDEX.md) for the full map (status, sources, target files).
2. Import from `@/shared/prep/...` in **otaku-web-app** (copy/sync to `otaku-web-app/src/shared/prep/` when needed).
3. Import via relative path from SPAs: `../../shared/prep/...`.

## Modules

| File | Source | Wire into |
|------|--------|-----------|
| `manifest.ts` | All sources | CI / planning |
| `crdtConfig.ts` | `yjs_crdt_realtime_theory`, ADV-05 | `unified-new` CRDT provider |
| `dualDbMode.ts` | `MASTER_ARCHITECTURE_2026` §1, snippet_drizzle_schema_dual | Tauri + Drizzle |
| `agentInventoryTypes.ts` | `RESEARCH_AI_AGENT_INVENTORY`, snippet_ai_agent_inventory | Play API, AIAssistant |
| `checkoutFsmFull.ts` | ADV-07, snippet23 (lite FSM exists) | gildija-lt CheckoutModal |
| `oramaLoreIndex.ts` | ADV-20, snippet36 | Assistant lore (optional WASM) |
| `mediaOramaIndex.ts` | ADV-20 + mediaSearch | Library catalog (Next + Vite) |

## Backend worker

See [`../backend/workers/gamification-cqrs-worker.mjs`](../backend/workers/gamification-cqrs-worker.mjs) + SQL notify trigger in `otaku-web-app/src/db/migrations/0001_gamification_notify.sql`.

## otaku-web-app prep

See `otaku-web-app/src/lib/prep/` for RSC loaders and server-action-shaped award mutation (BLUEPRINT priorities 1–3).
