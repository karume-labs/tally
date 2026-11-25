import { eq } from "drizzle-orm";
import { createId } from "@/lib/utils";
import { getDb } from "./client";
import * as schema from "./schema";
import type { SplitDayInput } from "./splits";

/** Rewrites a day's exercise rows, keeping the submitted order. */
export const replaceDayExercises = async (
  dayId: string,
  day: SplitDayInput,
): Promise<void> => {
  const db = getDb();
  await db
    .delete(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, dayId))
    .run();
  if (day.exercises.length === 0) return;
  await db
    .insert(schema.splitDayExercises)
    .values(
      day.exercises.map((exercise, index) => ({
        id: createId(),
        splitDayId: dayId,
        exerciseId: exercise.exerciseId,
        order: index,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        restSeconds: exercise.restSeconds,
        supersetGroup: exercise.supersetGroup,
      })),
    )
    .run();
};
