import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import * as schema from "./schema";

export interface TodayExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number;
  notes: string;
  order: number;
  supersetGroup: string | null;
}

/**
 * A split day's exercises in display order. The rows it joins through carry the
 * per-day targets, so the exercise row alone is not enough.
 */
export const loadDayExercises = async (
  splitDayId: string,
): Promise<TodayExercise[]> => {
  const db = getDb();
  const sdeRows = await db
    .select()
    .from(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, splitDayId))
    .orderBy(schema.splitDayExercises.order);
  if (sdeRows.length === 0) return [];

  const exercises: TodayExercise[] = [];
  for (const sde of sdeRows) {
    const exRows = await db
      .select()
      .from(schema.exercises)
      .where(eq(schema.exercises.id, sde.exerciseId))
      .limit(1);
    const ex = exRows[0];
    if (!ex) continue;
    exercises.push({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      targetSets: sde.targetSets,
      targetReps: sde.targetReps,
      restSeconds: sde.restSeconds ?? 90,
      notes: sde.notes ?? "",
      order: sde.order ?? 0,
      supersetGroup: sde.supersetGroup,
    });
  }
  return exercises.sort((a, b) => a.order - b.order);
};

/** A day's exercises looked up by split id and day name, or [] when unknown. */
export const getExercisesForDay = async (
  splitId: string,
  dayName: string,
): Promise<TodayExercise[]> => {
  const rows = await getDb()
    .select({ id: schema.splitDays.id })
    .from(schema.splitDays)
    .where(
      and(
        eq(schema.splitDays.splitId, splitId),
        eq(schema.splitDays.name, dayName),
      ),
    )
    .limit(1);
  const day = rows[0];
  if (day == null) return [];
  return loadDayExercises(day.id);
};
