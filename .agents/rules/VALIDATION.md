# Validation Rule

Validation schemas are the single source of truth for external/untrusted data.
Pick the validator that matches the stack and derive types from it.

## Stacks in use

| Stack | Validator | Where | Notes |
| :----- | :--------- | :----- | :----- |
| Elysia server | TypeBox + `Value.Check`/`Value.Convert` | `rules/ELYSIA-EDEN.md` | Hard-fail on boot; `Static<typeof>` for inferred types. |
| oRPC + Next.js | Zod | `rules/ORPC.md` + oRPC procedures | Zodinput/output schemas; inferred client types. |
| App-side forms / untrusted input | Zod | Feature modules | Derive `z.infer` for local types. |
| Persisted data | Drizzle schema | `src/db/schema.ts` | The schema is the source of truth for stored shapes. |

## TypeBox (Elysia)

- Define with `Type.Object`/`Type.Array`/`Type.String`/`Type.Number`/`Type.Optional` etc.
- Apply `Value.Default` then `Value.Convert`, then `Value.Check` on boot.
- Infer types with `Static<typeof schema>`.
- Hard-fail the process on invalid boot env/data rather than silently coercing.

## Zod

- Use `z.object`, `z.string`, `z.number`, `z.enum`, `z.array`, `z.lazy`, etc.
- Coerce where appropriate (`z.coerce.number()`, `z.coerce.date()`).
- Infer with `z.infer<typeof schema>`.
- Custom errors via `z.discriminatedUnion` or `.refine`/`.superRefine`.

## Rules

1. **One schema per untrusted boundary.** External input (env, API bodies,
   form values, file metadata) is validated once at the boundary; internal code
   consumes the validated shape.
2. **Derive, don't duplicate.** Types come from `z.infer` / `Static<typeof>` /
   Drizzle `$inferSelect`/`$inferInsert`; hand-written duplicates drift.
3. **Defaults live in the schema.** Use `.default()` / `Type.Default`, not
   `??` at the read site (see `rules/FALLBACKS.md`).
4. **Errors are typed.** Validation failures surface structured info; do not leak
   internals in production.
5. **Do not over-validate internal data.** Once data is in the DB via Drizzle, the
   schema is the guarantee; re-validating every read with Zod is noise unless the
   read crosses a trust boundary.

## Tally note

Tally has no Elysia server, so TypeBox is not in play. Use Zod for any
app-side validation of untrusted input (future import parsers, future sync
payloads, future settings forms). Persisted data is validated by the Drizzle
schema in `src/db/schema.ts`; that schema is the authority for stored shapes.
