# Tally

Offline-first workout and streak tracker built with React Native + Expo.

## Tooling

```sh
bun run format
bun run lint
bun run typecheck
```

Biome handles lint + format, `tsc --noEmit` handles types, and Bun is the runner.
Lefthook runs biome + typecheck on commit.

## Guardrails

Coding standards live in `.agents/rules/` and are indexed by [AGENTS.md](AGENTS.md).
They are mirrored from the org-wide guardrails repository; the project entry point
declares which ones apply to Tally and which are not applicable here.
