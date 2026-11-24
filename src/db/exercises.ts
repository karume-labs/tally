import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import * as schema from "./schema";
import type { TodayExercise } from "./today";

export const getExercisesForDay = async (
  splitId: string,
  dayName: string,
): Promise<TodayExercise[]> => {
  const db = getDb();
  const days = await db
    .select()
    .from(schema.splitDays)
    .where(
      and(
        eq(schema.splitDays.splitId, splitId),
        eq(schema.splitDays.name, dayName),
      ),
    )
    .limit(1);
  if (days.length === 0) return [];
  const splitDay = days[0];
  const sdeRows = await db
    .select()
    .from(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, splitDay.id))
    .orderBy(schema.splitDayExercises.order);
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
