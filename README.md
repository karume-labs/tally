# Tally

Offline-first workout and streak tracker built with React Native + Expo.
Everything runs locally on the device: SQLite for persisted workouts, splits,
and streak state; MMKV for fast in-memory caches; and Android home-screen
widgets for at-a-glance streak and today-workout status.

## Stack

- **Runtime:** Expo + expo-router (file-based routes), React 19, React Native 0.86.
- **State:** Zustand for in-memory session and streak UI state; Drizzle ORM over
  expo-sqlite for persisted data.
- **Storage:** expo-sqlite (SQLite) + react-native-mmkv for widget sync data.
- **Styling:** Tailwind CSS v4 + tw-animate-css + a shadcn/ui-style primitive set
  generated into `components/ui/`. The UI library owns styling; no inline
  `style` overrides.
- **Tooling:** Biome for lint + format, `tsc --noEmit` for types, Bun as the
  package manager and runner, Lefthook for pre-commit hooks.

## Project layout

```
src/app/            expo-router routes (file = route)
src/features/<d>/  domain slices: components, hooks, services
src/shared/        cross-feature primitives, components, env, lib
src/db/            schema, migrations, client, seed
src/components/ui/ shadcn/ui primitives (read-only)
plugins/           expo config plugins (when native config is needed)
.agents/           mirrored guardrails — do not hand-edit the rules in isolation
```

## Getting started

```sh
bun install
bun run typecheck
bun run dev
```

`bun run start` opens the Expo dev server; `bun run dev` uses the dev client.
The first run will prompt for the standard Expo project setup.

## Available scripts

### Development

- `start` / `dev` — start the Expo dev server; `dev` uses the dev client.
- `android` / `ios` — prebuild and run on an Android emulator/device or iOS
  simulator.
- `clean` — remove `.expo` and `node_modules` for a fresh install.

### Database (Drizzle ORM)

- `db:generate` — generate new migrations from `src/db/schema.ts`.
- `db:studio` — open Drizzle Studio to inspect the local dev database.
- `db:pull` — pull the live SQLite database from a connected Android device into
  `data/tally-local.db` for local inspection.

### Code quality

- `lint` — `biome check .`
- `format` — `biome format --write .`
- `typecheck` — `tsc --noEmit`
- `test` — `bun test`

Always run these before finishing work:

```sh
bun run format
bun run lint
bun run typecheck
```

Lefthook runs `biome check --write` and `bun typecheck` on commit.

### Guardrails

Coding standards live in `.agents/rules/` and are indexed by
[AGENTS.md](AGENTS.md). They are mirrored from the org-wide guardrails
repository; the project entry point declares which ones apply to Tally and which
are not applicable here.

```sh
bun run sync:guardrails   # copy latest rules in (when a source checkout exists)
bun run guardrails:check  # fail if the mirror has drifted
```

## Native configuration

**Never edit `android/` or `ios/` directly.** Native config goes through
`app.json` or a config plugin in `plugins/`. The repo already has generated
native folders from a prior prebuild; if they drift, regenerate them with
`bun run prebuild` rather than hand-editing.

## What is not in this repo

This is a workout tracker, not an inference app or a messaging app. There is no
model, no GGUF/llama.cpp tooling, no SMS/telephony modules, and no server-side
env provisioning. If any of those appear here, that is a mistake.

## FAQ

- **Why Biome and not ESLint/Prettier?** Biome covers lint + format in one pass
  and is what the tooling guardrail specifies for this repo.
- **Why Zustand and not URL state?** Tally is offline-first mobile; there is no
  server-rendered shareable state. Zustand holds ephemeral session and streak UI
  cache; the DB is the authority.
- **Why widgets?** Android home-screen widgets give streak and today-workout
  status when the app is backgrounded. The widget task handler lives in
  `src/widgets/widget-task-handler.tsx`.
