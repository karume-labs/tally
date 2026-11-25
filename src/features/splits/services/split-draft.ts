import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { SplitDayInput, SplitInput } from "@/db/splits";
import type {
  DraftDay,
  DraftExercise,
  SplitDraft,
} from "@/features/splits/types";

/** Loads a split (with days, exercises and targets) into an editable draft. */
export const loadSplitDraft = async (
  splitId: string,
): Promise<SplitDraft | null> => {
  const db = getDb();
  const splitRows = await db
    .select()
    .from(schema.splits)
    .where(eq(schema.splits.id, splitId))
    .limit(1);
  const split = splitRows[0];
  if (!split) return null;

  const dayRows = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId))
    .orderBy(schema.splitDays.dayOrder);

  const days: DraftDay[] = [];
  for (const day of dayRows) {
    const links = await db
      .select()
      .from(schema.splitDayExercises)
      .where(eq(schema.splitDayExercises.splitDayId, day.id))
      .orderBy(schema.splitDayExercises.order);
    const exercises: DraftExercise[] = [];
    for (const link of links) {
      const rows = await db
        .select({ name: schema.exercises.name })
        .from(schema.exercises)
        .where(eq(schema.exercises.id, link.exerciseId))
        .limit(1);
      exercises.push({
        exerciseId: link.exerciseId,
        name: rows[0]?.name ?? "Unknown exercise",
        targetSets: link.targetSets ?? 3,
        targetReps: link.targetReps ?? "8-12",
        restSeconds: link.restSeconds ?? 90,
        supersetGroup: link.supersetGroup,
      });
    }
    days.push({
      id: day.id,
      name: day.name,
      isRestDay: day.isRestDay ?? false,
      exercises,
    });
  }

  return {
    id: split.id,
    name: split.name,
    description: split.description ?? "",
    days,
  };
};

/** The shape the db layer writes: ids kept for existing days, drops blanks. */
export const toSplitInput = (draft: SplitDraft): SplitInput => {
  const days: SplitDayInput[] = draft.days
    .filter((day) => day.name.trim() !== "")
    .map((day) => ({
      id: day.id,
      name: day.name.trim(),
      isRestDay: day.isRestDay,
      exercises: day.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        restSeconds: exercise.restSeconds,
        supersetGroup: exercise.supersetGroup,
      })),
    }));
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    days,
  };
};
