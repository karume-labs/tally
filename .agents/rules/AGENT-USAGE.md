# Agent Usage Rule

How an AI agent loads and applies these guardrails when working in a project.

Keep the repository entry point named exactly `AGENTS.md`. Codex discovers that
filename directly, and current Claude Code releases use it when no
`CLAUDE.md` exists. A project-local `CLAUDE.md` remains that project's
entry point; rely on the existing file if present.

## Why this file

Reading correct, complete rules at the start of a task changes the code an
agent produces. This file defines the loading order and the task workflow so
the same behavior happens regardless of which agent (opencode, Cursor, Claude,
Codex, ...) is running.

## 1. Surface the rules into context

Agents only follow rules that are actually in their context. Instead of
instructing the model to fetch external repositories, make the content directly
available:

- **Recommended:** mirror `rules/*.MD` + `examples/*.MD` into the working
  repo under `.agents/` (or `.github/`/docs), and add a pointer in the repo's
  `AGENTS.md`.
- **Synchronized:** git submodule or a `bun`/scripted copy job keeps them in
  sync across projects. Update all workspaces when guardrails change.
- **Strict trade-off:** injecting the full set costs context tokens. On large
  tasks, load only the rules for the files being touched (see load order).

## 2. Load order (before writing code)

1. Read `AGENTS.md` - the index + hard rules.
2. Read the **always-on** set:
   - `GENERAL.md` (baseline TS, imports, arrow functions, 150-line cap)
   - `NAMING.md` (kebab-case, PascalCase components)
   - `FEATURE-FOLDER.md` (feature-first rails between API and web)
   - `FALLBACKS.md` (no `??`/`||`/`as` on already-typed values)
   - `TOOLING.md` and `ENV-VARS.md` (commands + typed env)
3. Read the **stack-specific** file(s) for the project:
   - Elysia standalone API → `ELYSIA-EDEN.md` + `VALIDATION.md` (TypeBox)
   - oRPC + Next.js → `ORPC.md` + `VALIDATION.md` (Zod)
   - Mantine UI → `STYLING.md` (Mantine sections)
   - shadcn UI → `STYLING.md` (shadcn sections)
   - React Native / Expo → `REACT-NATIVE.md`
   - React Native Reusables → `REACT-NATIVE-REUSABLES.md`
4. Read **task-dependent** files when the task touches that concern:
   `REACT.md`, `NEXTJS.md`, `DATA-FETCHING.md`, `STATE-MANAGEMENT.md`,
   `DATA-TABLES.md`, `SEO.md`, `AUTH.md`, `DRIZZLE.md`, `SEEDING.md`,
   `API-CONTRACT.md`.
5. Mirror shapes from `examples/*.MD` that match the task.

## 3. Task workflow

1. **Survey first.** Read the relevant rules, then the surrounding repo code.
   Match existing conventions instead of guessing.
2. **Apply while writing.**
   - Use absolute aliases for all imports.
   - Arrow functions + named exports (`export const`).
   - Keep files under 150 lines; split on growth.
   - All data fetching through the typed client + TanStack Query.
   - Trust validated env or contract-typed data types natively without `??`/`||`/`as` fallbacks
     (`rules/FALLBACKS.md`).
   - Restrict `process.env` usage to `env/index.ts`; consume the validated `env`
     object everywhere else.
   - Filter/page/sort state lives in nuqs URL params.
   - Let the UI library own styling - rely on its built-in configuration over `className`/`style` overrides.
3. **Verify before finishing.** Run the Tooling checks:
   `bun format`, `bun lint`, `bun typecheck` (exact commands may differ per
   project - check its package.json).
4. **Report honestly.** If a rule could not be followed (framework constraint,
   missing config), say so explicitly rather than silently deviating.

## 4. Precedence

- Project-local `AGENTS.md` / `.agents/RULES.md` > guardrails. The project
  may tighten or override a stacked rule; defaults here are the floor.
- Guardrails > generic assistant behavior. These rules win over "best
  practices" the model invented on its own.
- If two guardrail rules conflict, the more specific one wins (e.g. a
  stack-specific file beats `GENERAL.md`).

## 5. When the repo evolves

- Rules are split so a 150-line cap applies per file. When adding a rule,
  update `AGENTS.md` (the index) and `README.md` (the human summary).
- Re-run the guardrails synchronisation (section 1) after changes so every
  consuming project picks them up.
