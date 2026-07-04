# Gamification database

Event-sourced ledger (`gamification_events`) plus CQRS projection (`user_stats`).

## Apply migration

With `DATABASE_URL` in `.env.local`:

```bash
npm run db:push
# or apply SQL manually:
# psql $DATABASE_URL -f src/db/migrations/0000_gamification.sql
# psql $DATABASE_URL -f src/db/migrations/0001_gamification_notify.sql
```

## Async CQRS worker (prep)

After `0001_gamification_notify.sql`:

```bash
cd ../backend && npm install && npm run worker:cqrs
```

See [`INTEGRATION_PREP_INDEX.md`](../../INTEGRATION_PREP_INDEX.md) and `backend/workers/gamification-cqrs-worker.mjs`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:generate` | Regenerate migrations from `src/db/schema.ts` |
| `npm run db:push` | Push schema to Postgres (dev) |
| `npm run db:studio` | Drizzle Studio UI |

## API

- `GET /api/gamification/stats?userId=<firebase_uid>` — hydrate client bar
- `POST /api/gamification/award` — append event + update projection

Without `DATABASE_URL`, APIs return `{ persisted: false }` and the client uses localStorage only.
