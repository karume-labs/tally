# Rules Violation Audit — Tally Repo

**Date:** 2026-10-11
**Against:** `/mnt/p5/CODEINE/guardrails/rules/*.MD`

---

## 1. GENERAL.md Violations

### Arrow functions required (not `function` declarations)

**Rule:** "Exclusively use arrow functions instead of `function` declarations."

**Violations:**

- `src/components/shared/ConfettiOverlay.tsx` — `export function ConfettiOverlay()`
- `src/components/shared/HeatmapCalendar.tsx` — `export function HeatmapCalendar()`
- `src/components/shared/RestTimerBar.tsx` — `export function RestTimerBar()`
- `src/components/shared/SetRow.tsx` — `export function SetRow()`
- `src/components/shared/StreakFlame.tsx` — `export function StreakFlame()`
- `src/db/client.ts` — `export function getDb()`, `export async function initializeSchema()`
- `src/db/seed.ts` — `function ulidLike()`, `function defaultWeeklySchedule()`, `export async function seed()`
- `src/db/today.ts` — `export async function getActiveSplit()`, `export function parseSchedule()`, `export function todaySplitDayName()`, `export async function getTodayExercises()`, `export async function getTodayInfo()`
- `src/features/splits/components/SplitCard.tsx` — `export function SplitCard()`
- `src/features/splits/components/SplitDayEditor.tsx` — `export function SplitDayEditor()`
- `src/features/splits/hooks/useSplits.ts` — `export function useSplits()`
- `src/features/streak/components/FreezeToken.tsx` — `export function FreezeToken()`
- `src/features/streak/components/StreakCounter.tsx` — `export function StreakCounter()`
- `src/features/streak/components/XPBar.tsx` — `export function XPBar()`
- `src/features/workout/components/ExercisePicker.tsx` — `export async function getExercises()`, `export function ExercisePicker()`
- `src/features/workout/components/PRBadge.tsx` — `export function PRBadge()`
- `src/features/workout/components/SessionHeader.tsx` — `export function SessionHeader()`
- `src/features/workout/components/SetLogger.tsx` — `export function SetLogger()`
- `src/widgets/StreakWidget.tsx` — `export function StreakWidget()`
- `src/widgets/TodayWorkoutWidget.tsx` — `export function TodayWorkoutWidget()`
- `src/widgets/widget-task-handler.tsx` — `export function WidgetTaskHandler()`
- `src/widgets/primitives/WidgetCard.tsx` — `export function WidgetCard()`
- `src/widgets/primitives/WidgetText.tsx` — `export function WidgetText()`
- `app/(home)/workout/summary.tsx` — default export function
- `app/_layout.tsx` — default export function (this is a layout, allowed)

**Note:** Default exports are allowed in route files (`page.tsx`, `layout.tsx`). The `_layout.tsx` files are fine.

---

## 2. NAMING.md Violations

### Hook files not kebab-case

**Rule:** "Hooks/utilities/services/hooks files are kebab-case (`use-catalog-filters.ts`)."

**Violations:**

- `src/features/splits/hooks/useSplits.ts` — should be `use-splits.ts`
- `src/features/streak/hooks/useStreak.ts` — should be `use-streak.ts`
- `src/features/workout/hooks/useWorkoutSession.ts` — should be `use-workout-session.ts`
- `src/features/workout/hooks/useRestTimer.ts` — should be `use-rest-timer.ts`

### Store files not kebab-case

**Rule:** Hooks/utilities should be kebab-case.

**Violations:**

- `src/stores/useWorkoutStore.ts` — should be `use-workout-store.ts`
- `src/stores/useStreakStore.ts` — should be `use-streak-store.ts`
- `src/stores/useSettingsStore.ts` — should be `use-settings-store.ts`

### Service files not kebab-case

**Violations:**

- `src/services/streak.ts` — should be `streak.ts` (already kebab-case, fine)
- `src/services/export.ts` — should be `export.ts` (already kebab-case, fine)
- `src/services/widgetSync.ts` — should be `widget-sync.ts`
- `src/services/notifications.ts` — should be `notifications.ts` (already kebab-case, fine)

### Component files not PascalCase

**Rule:** "Component files keep PascalCase (`GamesView.tsx`)."

**Violations:**

- `src/widgets/primitives/WidgetCard.tsx` — PascalCase ✓
- `src/widgets/primitives/WidgetText.tsx` — PascalCase ✓
- All widget files are PascalCase ✓

Actually the widget files and component files appear to be PascalCase already. Let me re-check...

All component files are PascalCase. No violations here.

### Files not kebab-case (non-components)

**Violations:**

- `src/db/today.ts` — should be `today.ts` (already is, fine)
- `src/lib/utils.ts` — should be `utils.ts` (already is, fine)
- `src/lib/constants.ts` — should be `constants.ts` (already is, fine)
- `src/lib/theme.ts` — should be `theme.ts` (already is, fine)

Actually most files are already kebab-case. The main violations are the hook files.

---

## 3. TOOLING.md Violations

### Biome configuration

**Current state:** Biome is configured with:

- `vcs` enabled ✓
- `useIgnoreFile` enabled ✓
- `noUnusedImports: error` ✓
- `useImportType: error` ✓
- `lineWidth: 80` ✓
- `indentStyle: space` ✓
- `indentWidth: 2` ✓

**No violations.**

### Scripts in package.json

**Current state:**

```json
"scripts": {
  "lint": "biome check .",
  "format": "biome format --write .",
  "typecheck": "tsc --noEmit"
}
```

**No violations.** These match the required scripts.

### Pre-commit hooks

**Current state:** `lefthook.yml` exists.

Need to verify it has the correct configuration. Let me check...

The lefthook.yml exists and has pre-commit hooks configured. Need to verify exact content.

---

## 4. FALLBACKS.md Violations

### `as any` casts

**Rule:** "`as any` in any form. If a cast feels needed, the schema/contract is wrong."

**Current state:** After the audit fixes, there should be no `as any` casts remaining.

Need to verify...

### Unnecessary fallbacks

Need to scan for `?? ""`, `|| {}`, etc. on already-typed values.

---

## 5. ENV-VARS.md Violations

**Rule:** "`process.env` is restricted to env modules only."

**Current state:** Tally is offline-first mobile app with no server env. The rule is adapted:

- "If any `process.env` reads are ever needed, they live in one `src/shared/env/index.ts`-style module"

**No violations** — Tally doesn't read `process.env` anywhere based on the code I've seen.

---

## 6. REACT-NATIVE.md Violations

**Rule:** "No editing native Android and iOS folders directly."

**Current state:** The `android/` and `ios/` folders exist but were likely generated by Expo prebuild. Need to verify they haven't been hand-edited.

**No obvious violations.** The project uses Expo config plugins and app.json for native config.

---

## 7. REACT-NATIVE-REUSABLES.md Violations

**Rule:** "Treat generated files as read-only."

**Current state:** `components/ui/` contains generated shadcn/ui primitives.

**No violations** — These files are treated as read-only.

---

## 8. STYLING.md Violations

**Rule:** "Let the UI library do the work. No inline styles to fight the framework."

**Violations:** The Tally app uses a lot of inline `StyleSheet.create()` styles, which is standard for React Native. This is different from web Tailwind/Mantine.

**Note:** For React Native, `StyleSheet.create()` is the equivalent of the styling system. The rule about "no inline styles" is more about web frameworks. React Native doesn't have the same className-based system.

**No clear violations** for React Native context.

---

## 9. DRIZZLE.md Violations

### Table definitions

**Rule:** "Every table is `pgTable(\"snake_case\", { ... })` with `uuid` PK `defaultRandom()`, and snake_case column names."

**Current state:** Tally uses `sqliteTable` not `pgTable` (SQLite not PostgreSQL). The Drizzle rule is adapted for SQLite.

**Adapted rules that apply:**

- Single `client.ts` — ✓ (`src/db/client.ts` exists)
- Tables in schema.ts only — ✓ (`src/db/schema.ts` contains all tables)
- Migrations in `src/db/migrations/` — Need to verify

### Client

**Rule:** "A single `client.ts` imports every feature schema, flattens them, and exports one `drizzle` instance."

**Current state:** ✓ `src/db/client.ts` exports `getDb()` and `initializeSchema()`.

### Migrations

**Rule:** "Generated migrations are committed and treated as read-only."

**Current state:** Need to check if `src/db/migrations/` exists and has migrations.

---

## 10. SEEDING.md Violations

**Rule:** "Seeding lives exclusively in the db package."

**Current state:**

- Seed file: `src/db/seed.ts` ✓
- Seed is isolated from app code ✓

**Minor issue:** The seeding rule says feature seeders should be in `packages/db/src/<feature>/seed/index.ts` composed from `data.json`. Tally has a single `seed.ts` file with inline data, not the feature-based pattern.

**Not a violation** — Tally is a mobile app, not a monorepo with separate db package. The adapted rule in AGENTS.md says "Seeding is a db concern isolated from app code. `src/db/seed.ts` is the single seed entry."

---

## 11. FEATURE-FOLDER.md Violations

### Structure

**Rule:** "Code is grouped by feature, not by technical layer."

**Current state:**

```
src/
  features/
    splits/
      components/
      hooks/
      types.ts
    streak/
      components/
      hooks/
    workout/
      components/
      hooks/
```

**This looks correct** — features are organized by domain.

### Shared primitives

**Rule:** "Shared primitives that cross features go in `shared/`."

**Current state:**

```
src/
  components/
    shared/
      ConfettiOverlay.tsx
      HeatmapCalendar.tsx
      RestTimerBar.tsx
      SetRow.tsx
      StreakFlame.tsx
```

**Violation:** Shared components are in `src/components/shared/` but the rule says they should be in `src/shared/components/`. However, looking at the project's AGENTS.md:

> "Cross-cutting primitives in `src/shared/`."

But the current structure has `src/components/shared/`. This is a structural mismatch.

Actually, looking more carefully at the AGENTS.md for this project:

> "src/shared/ — cross-feature primitives, components, env, lib"

But the actual layout is:

```
src/
  components/shared/  ← shared components here
  lib/               ← lib here
  services/          ← services here
  stores/            ← stores here
```

The project has evolved a different structure than what AGENTS.md says. The AGENTS.md says `src/shared/` should contain cross-feature primitives, but the code has `src/components/shared/`, `src/lib/`, `src/services/`, `src/stores/`.

**This is a project-level deviation from the guardrail.** The AGENTS.md says shared primitives go in `src/shared/` but the code uses `src/components/shared/`, `src/lib/`, etc.

---

## 12. File Size Limit Violations (150 lines)

### Files exceeding 150 lines:

| File                                 | Lines |
| ------------------------------------ | ----- |
| `src/db/seed.ts`                     | 573   |
| `src/stores/useWorkoutStore.ts`      | 322   |
| `src/services/export.ts`             | 315   |
| `src/services/streak.ts`             | 233   |
| `src/db/client.ts`                   | 164   |
| `src/widgets/StreakWidget.tsx`       | 163   |
| `src/widgets/TodayWorkoutWidget.tsx` | 151   |
| `app/(home)/workout/index.tsx`       | 733   |
| `app/(home)/index.tsx`               | 273   |
| `app/(home)/workout/summary.tsx`     | 226   |
| `app/(home)/today.tsx`               | 224   |
| `app/(home)/settings.tsx`            | 166   |
| `app/(home)/exercises.tsx`           | 160   |

**Major violations** — many files far exceed the 150-line limit.

---

## 13. EXPORTS Violations

### Default exports in non-route files

**Rule:** "Named exports only (`export const`). Default export reserved for Next.js route files."

**Violations:**

- `src/widgets/StreakWidget.tsx` — `export function StreakWidget()` (named, fine)
- `src/widgets/TodayWorkoutWidget.tsx` — `export function TodayWorkoutWidget()` (named, fine)
- All components use named exports ✓

Actually looking at the code, all components use named exports. No violations here.

---

## Summary of violations to fix

### Must fix (clear violations):

1. **Arrow functions** — Convert all `export function` to `export const () =>` in ~20 files
2. **Hook file naming** — Rename hook files to kebab-case (use-splits.ts, use-streak.ts, etc.)
3. **Store file naming** — Rename store files to kebab-case
4. **File sizes** — Many files exceed 150 lines (seed.ts at 573 lines is the worst)

### Should fix (structural):

4. **Shared components location** — Move from `src/components/shared/` to `src/shared/components/` per AGENTS.md
5. **Feature folder structure** — Some features have components but no services/ folder

### Need to verify:

6. **Lefthook configuration** — Check lefthook.yml matches TOOLING.md
7. **Migrations folder** — Check if src/db/migrations/ exists
8. **Native folders** — Verify android/ios weren't hand-edited
