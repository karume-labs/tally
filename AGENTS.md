# AGENTS.md

Project entry point for coding agents working on **Tally** (React Native + Expo,
offline-first workout/streak tracker).

The coding standards themselves live in `.agents/rules/`, mirrored from the
organization-wide guardrails repository so they are actually present in the
context an agent loads. This file says which of them apply to this project and
what this project adds on top.

## Load order

1. This file.
2. `.agents/rules/AGENT-USAGE.md` — how agents apply the rules.
3. The always-on set:
   - `GENERAL.md` — arrow functions, named exports, ~150-line cap, absolute
     `@/` imports, no emojis in UI, no gradients, comments explain *why*.
   - `NAMING.md` — kebab-case folders/files, PascalCase component files whose
     export matches the filename, single-file folders collapse to `constants.ts`.
   - `FEATURE-FOLDER.md` — group by domain
     (`src/features/<domain>/{components,hooks,services}`), cross-cutting
     primitives in `src/shared/`.
   - `FALLBACKS.md` — no `??`/`||`/`as` on values the type system already
     guarantees; defaults live in the schema or query builder.
   - `TOOLING.md` — Biome for lint + format, `tsc` for types, Bun as the
     runner. Finish with `bun run format`, `bun run lint`, `bun run typecheck`.
   - `ENV-VARS.md` — `process.env` confined to a single validated `env` module;
     everything else imports the typed `env`.
4. Stack-specific:
   - `REACT-NATIVE.md` — **never edit `android/` or `ios/` directly**; native
     config goes through `app.json` or a config plugin in `plugins/`.
   - `REACT-NATIVE-REUSABLES.md` — generated `components/ui/` primitives are
     read-only; extend via wrapper components or new CVA variants.
   - `STYLING.md` — the UI library owns styling; no inline `style` overrides.
   - `DRIZZLE.md` — Drizzle tables, relations, single `client.ts`, migrations.
   - `SEEDING.md` — seeding is a db concern; data-driven, idempotent, feature
     seeders composed from `data.json`.
   - `VALIDATION.md` — Zod for app-side validation where used; TypeBox only for
     the (absent) Elysia server; Tally's DB schema is the source of truth for
     persisted shapes.
5. Task-dependent files when the task touches that concern:
   `STATE-MANAGEMENT.md` (Zustand stores are Tally's state primitive), `TESTING.md`.

`.agents/examples/` holds copy-ready patterns for the stacks this repo touches.

## Rules that apply here

Everything in `.agents/rules/` is available; in practice the rules below are the
ones that actually govern Tally. Rules that are web/Next.js/Elysia/oRPC-specific
and not applicable are present in the mirror for completeness but are **not** in
force.

| Rule | Status | What it means in this repo |
| --- | --- | --- |
| `GENERAL.md` | **in force** | Arrow functions with named exports. ~150-line hard cap per file. Absolute `@/` imports, never `../../`. Comments explain *why*, not history. No emojis in UI. No gradients. |
| `NAMING.md` | **in force** | kebab-case folders and non-component files, PascalCase component files whose export matches the filename. Single-file folders collapse to `constants.ts`. |
| `FEATURE-FOLDER.md` | **in force** | Grouped by domain (`src/features/<domain>/{components,hooks,services}`), not by technical layer. Cross-cutting primitives in `src/shared/`. |
| `FALLBACKS.md` | **in force** | No `??`/`||`/`as` on values the type system already guarantees. Defaults live in the schema or the query builder, not at the read site. |
| `TOOLING.md` | **in force** | Biome for lint + format, `tsc` for types, Bun as the runner. Finish with `bun run format`, `bun run lint`, `bun run typecheck`. Lefthook pre-commit runs biome + typecheck. |
| `ENV-VARS.md` | **in force (adapted)** | `process.env` is confined to one validated `env` module. Tally is offline-first and has no server env, so the rule collapses to: keep any `process.env` reads in one place and never scatter them. |
| `REACT-NATIVE.md` | **in force** | **Never edit `android/` or `ios/` directly.** Native config goes through `app.json` or a config plugin in `plugins/`. |
| `REACT-NATIVE-REUSABLES.md` | **in force** | Generated `components/ui/` primitives are read-only. Extend via wrapper components or new CVA variants, not by patching generated source. |
| `STYLING.md` | **in force** | The UI library owns styling. No inline `style` overrides to fight the framework. |
| `DRIZZLE.md` | **in force (adapted)** | Drizzle ORM for SQLite via expo-sqlite. Single `src/db/client.ts`, tables in `src/db/schema.ts` only, migrations in `src/db/migrations/`. The pg-specific bits (uuid, lifecycleTimestamps, decimal money) do not apply; Tally uses `text` PKs + `integer`/`real` columns. |
| `SEEDING.md` | **in force (adapted)** | Seeding is a db concern isolated from app code. `src/db/seed.ts` is the single seed entry. Idempotent via `onConflictDoNothing` / name-based skips. |
| `VALIDATION.md` | **in force (adapted)** | Tally has no Elysia server, so TypeBox is not in play. Use Zod for app-side validation where needed; the Drizzle schema is the source of truth for persisted data. |
| `SHADCN.md` | **in force** | shadcn/ui primitives in `components/ui/` are read-only. Compose via props/variants, not className overrides. `cn`/`cva`/`tailwind-merge` are the sanctioned mechanism. |
| `TESTING.md` | **in force** | Testing is expected; the org rule's current note is "I'll get to this once I get a method of testing that I like." Tally should treat tests as first-class once a testing approach is chosen. |
| `AGENT-USAGE.md` | **in force** | How agents load and apply these rules. |
| `API-CONTRACT.md` | not applicable | No API server in Tally; offline-first local DB. |
| `ORPC.md` | not applicable | No oRPC in Tally. |
| `ELYSIA-EDEN.md` | not applicable | No Elysia/Eden server in Tally. |
| `NEXTJS.md` | not applicable | Tally is Expo, not Next.js. |
| `DATA-FETCHING.md` | not applicable | No TanStack Query; Tally reads/writes local SQLite directly via Drizzle. |
| `DATA-TABLES.md` | not applicable | No TanStack Table in Tally. |
| `SEO.md` | not applicable | Mobile app; no SEO. |
| `AUTH.md` | not applicable | No Better Auth / server session in Tally. |
| `MANTINE.md` | not applicable | Tally uses shadcn/ui style, not Mantine. |
| `SKILL-CREATION.md` | not applicable | Not relevant to this repo. |

## This project adds

Tighter than the guardrails floor, and specific to this repo:

- **`bun test` before `bun typecheck`** once a test approach is wired. The type
  checker will not tell you a query stopped returning rows; a test will.
- **Pure logic in `.ts`, UI in `.tsx`.** Anything worth testing should be
  extractable into a plain module.
- **Table definitions live only in `src/db/schema.ts`.** A second
  `sqliteTable("sessions")` in a feature folder type-checks fine and then
  silently disagrees with the migrations.
- **No model or LLM file in the bundle.** This repo is a workout tracker, not an
  inference app. Do not bring in GGUF, llama.cpp, or any local-model tooling.
- **No SMS, phone, or telephony modules.** This is not Pennywise.

## Layout

```
src/app/            expo-router routes (file = route)
src/features/<d>/   domain slices: components, hooks, services
src/shared/         cross-feature primitives, components, env, lib
src/db/             schema, migrations, client, seed
components/ui/      shadcn/ui primitives (read-only)
plugins/            expo config plugins (when native config is needed)
.agents/            mirrored guardrails — do not hand-edit the rules in isolation
```

## Verify before you finish

```sh
bun run format
bun run lint
bun run typecheck
```

`.agents/` is a mirror. To change a rule, change it in the guardrails repository
and re-copy it here. Rules in this project's `.agents/rules/` that conflict with
the org-wide guardrails are intentional project-level tightenings; the project
rule wins for this repo.
