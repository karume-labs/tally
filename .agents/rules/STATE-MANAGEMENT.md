# State Management Rule

URL-driven state, derived state, and client state each have a clear home.

## URL-driven state

- Pagination, filters, sorts, search, and tab/selected IDs live in the URL via
  `nuqs` (or the framework's router search params where `nuqs` is not in play).
- The URL is the source of truth for shareable, bookmarkable state; components
  read from it and write back to it.
- Avoid mirroring URL state into separate client state; read it directly from the
  URL.

## Client state

- Local UI state (modals, draft forms, ephemeral selection) uses the framework's
  primitive state (`useState` / store) and lives as close to the UI that needs it
  as possible.
- Shared client state that is not URL-driven and not persisted goes into a single
  state manager with a clear ownership boundary; avoid scattering tiny `useState`
  atoms across many components for the same piece of state.

## Persisted state

- Persisted state lives in the database / storage layer, not in client state.
  Client state may cache persisted data, but the DB/storage is the authority and
  the cache must be regenerable from it.

## Derived state

- Derive from source of truth rather than syncing multiple copies. If a value can
  be computed from URL state, persisted state, or a store, compute it at read time
  instead of maintaining a second writable copy.

## Tally note

Tally is offline-first with no URL routing for app state (expo-router routes map
to screens, not to filter state). In practice:

- **URL-driven state:** not used; there is no server-rendered shareable state.
- **Client state:** Zustand stores (`src/stores/`) hold in-memory session state
  (active workout, streak UI cache, settings). Zustand is the sanctioned client
  state primitive for Tally.
- **Persisted state:** SQLite via Drizzle (`src/db/`) is the authority. Stores may
  hold a cached read of `streak_state` / today's exercises, but they must be
  regenerable from the DB and must not be the primary record.
- **Derived state:** derive from the store or the DB at read time; do not maintain
  parallel writable copies.
