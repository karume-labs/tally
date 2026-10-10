# Drizzle Rule

SQLite via **Drizzle ORM**, colocated in the db package.

## Layout

The db package owns schema, client, migrations, and seed:

```
src/db/
  schema.ts            # every table lives here (single source)
  client.ts            # single drizzle instance, all schemas flattened in
  migrations/          # drizzle-kit generated SQL (read-only)
  seed.ts              # single seed entry (see SEEDING.md)
  today.ts             # read helpers for the active split / today's exercises
```

## Table definitions

- Every table is `sqliteTable("snake_case", { ... })` with a `text` primary key
  (generated with `crypto.randomUUID()` at write time) and snake_case column names.
- Spread lifecycle columns (`created_at`, `updated_at`) where the domain wants
  them; Tally often stores timestamps as `integer` Unix milliseconds or ISO
  `text` day keys depending on the feature.
- Booleans use `integer("...", { mode: "boolean" })` with an explicit default
  (`default(false)`).

```ts
// Good
export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

- The pg-specific bits from the org-wide rule do **not** apply here:
  `uuid()`, `defaultRandom()`, `lifecycleTimestamps()`, `varchar()`,
  `decimal({ precision, scale })` are PostgreSQL concepts. Tally uses `text`,
  `integer`, `real`, and `text` timestamps/day-keys.

## Relations

- Define relations with `drizzle-orm/relations` where they help clarify FK
  semantics, but the FK columns themselves are declared on the table with
  `.references(() => parentTable.id, { onDelete: "cascade" })` (or
  `onDelete: "no_action"` where cascade is wrong).
- Keep `onDelete` semantics explicit - ensure cascade is included on child tables
  that should vanish with their parent, and `no_action` where a parent delete
  must be blocked or simply leave orphans.

## Client

A single `client.ts` imports the one schema file, creates the `drizzle` instance
over the single expo-sqlite database, and exports it. Consumers import `{ getDb }`
only from `@/db/client`.

```ts
// client.ts
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const expoDb = openDatabaseSync("tally.db");
  _db = drizzle(expoDb, { schema });
  return _db;
}
```

- Lazy-init the handle so expo-sqlite is only opened after Expo has bootstrapped.
- Do not open multiple database instances; the singleton is the one source of
  truth for the in-memory schema mapping.

## CLI / migrations

- `drizzle.config.ts` points at `./src/db/schema.ts`, outputs to
  `./src/db/migrations`, and uses the `expo` driver.
- Generated migrations are committed and treated as read-only.
- Scripts live in the project `package.json`: `db:generate`, `db:studio` (when
  useful), and inline seed via `src/db/seed.ts`.

## Conventions

- Money/volume columns are `real` for Tally's volume tracking; be aware that
  floating point is not ideal for currency generally, but Tally tracks lifted
  volume (weight × reps) where `real` is acceptable.
- Booleans default explicitly (`isRestDay: integer("is_rest_day", { mode: "boolean" }).default(false)`).
- Use `.unique()`/unique indexes for slug- or code-uniqueness where the domain
  wants it (Tally mostly uses `id` uniqueness for exercises).
- Query shapes are projected with `.select({ ... })` - specify only the necessary
  columns unless the whole row is truly needed.
- **Table definitions live only in `src/db/schema.ts`.** A second
  `sqliteTable("sessions")` in a feature folder type-checks fine and then
  silently disagrees with the migrations.

## Migrations in this repo

- The migration is applied at runtime via an embedded `IF NOT EXISTS` SQL string
  in `client.ts` (so the DB is bootstrapped on first open without a separate
  migrator process). The `src/db/migrations/*.sql` files are still the source of
  truth for the schema definition and should be regenerated when `schema.ts`
  changes.
- Do not hand-edit generated migration SQL to "fix" the schema; change
  `schema.ts` and regenerate.
