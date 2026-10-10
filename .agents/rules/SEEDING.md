# Seeding Rule

Seeding is a database concern and lives **only** in the db package, isolated
from app code.

## Layout

```
src/db/
  schema.ts        # authoritative schema
  client.ts        # one DB handle
  seed.ts          # single seed entry point
  migrations/      # generated SQL (read-only)
```

## Idempotency

- Seeders must be idempotent: re-running the same seed file does not duplicate
  rows. Use `onConflictDoNothing`, name-based skips, or `WHERE NOT EXISTS`.
- Seed data is **data-driven**, not hand-written rows scattered across features.
  Feature seeders are composed from a shared `data.json` of building blocks
  (exercises, muscle groups, equipment, predefined splits) so a single source
  of truth drives both the seed and any future JSON-based UI factories.

## Entry point

- `src/db/seed.ts` is the only seed entry. It imports each feature seeder and
  calls them in a fixed order.
- Feature seeders live at `src/db/<feature>/seed/index.ts` where there is more
  than one file's worth; single-feature seeders collapse to
  `src/db/seed-<feature>.ts`.

## Rules

1. **One seed entry.** Do not wire seed logic into app startup, screens, or
   feature hooks. The DB is the authority; the app reads from it, it does not
   bootstrap it at runtime.
2. **Schema-first.** Seed shapes follow `schema.ts`. Do not hand-maintain a
   parallel shape in the seed file; derive insert types from the schema where
   practical.
3. **Ordering.** Reference data (muscle groups, equipment, exercises) seeds
   before workouts/sessions/sets that depend on it.
4. **No secrets or personal data.** A seed file is shipped code. No tokens,
   phone numbers, or user-specific data.
5. **Regenerate, don't patch.** If a seed file drifts from the schema, fix the
   schema or the seed data at the source — not by editing generated migration
   SQL.

## Tally note

Tally is offline-first. Seeding happens once (first DB open or an explicit
`db:seed` script), not on every app launch. The active split + exercises shown
on the home/today screens come from persisted rows, not from in-memory defaults,
so the seed is the source of truth for a fresh install's default content.
