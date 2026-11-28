import { eq } from "drizzle-orm";
import { createId } from "@/lib/utils";
import type { getDb } from "./client";
import type SEED from "./data.json";
import * as schema from "./schema";
import { resolveTarget } from "./seed-plan";

type SeedDb = ReturnType<typeof getDb>;
type SeedDay = (typeof SEED.splits)[number]["days"][number];

/**
 * Rewrites one day's exercise rows from a preset definition. Superset rounds,
 * targets and rest come from the preset, so this is only for seeds and seed
 * migrations, never for edits a user made.
 */
export const replacePresetDayExercises = async (
  db: SeedDb,
  dayId: string,
  day: SeedDay,
  exerciseIdByName: Map<string, string>,
): Promise<void> => {
  await db
    .delete(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, dayId))
    .run();

  const links: Array<typeof schema.splitDayExercises.$inferInsert> = [];
  day.exercises.forEach((entry, order) => {
    const target = resolveTarget(entry);
    const exerciseId = exerciseIdByName.get(target.name);
    if (exerciseId == null) return;
    links.push({
      id: createId(),
      splitDayId: dayId,
      exerciseId,
      order,
      targetSets: target.sets,
      targetReps: target.reps,
      restSeconds: target.rest,
      notes: target.notes.length > 0 ? target.notes : null,
      supersetGroup: target.group.length > 0 ? target.group : null,
    });
  });
  if (links.length > 0) {
    await db.insert(schema.splitDayExercises).values(links).run();
  }
};
