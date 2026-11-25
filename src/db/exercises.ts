import { and, eq, like } from "drizzle-orm";
import type { Equipment, MuscleGroup } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { getDb } from "./client";
import * as schema from "./schema";

export interface CustomExerciseInput {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment | null;
}

export const createCustomExercise = async (
  input: CustomExerciseInput,
): Promise<void> => {
  await getDb()
    .insert(schema.exercises)
    .values({
      id: createId(),
      name: input.name,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment,
      isCustom: true,
      createdAt: new Date(),
    })
    .run();
};

export const updateCustomExercise = async (
  id: string,
  input: CustomExerciseInput,
): Promise<void> => {
  await getDb()
    .update(schema.exercises)
    .set({
      name: input.name,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment,
    })
    .where(
      and(eq(schema.exercises.id, id), eq(schema.exercises.isCustom, true)),
    )
    .run();
};

/**
 * Only custom exercises can be deleted, and only when nothing references them:
 * the foreign keys have no cascade, and wiping logged sets would lose history.
 */
export const deleteCustomExercise = async (id: string): Promise<void> => {
  const db = getDb();
  const [planUse, logUse] = await Promise.all([
    db
      .select({ id: schema.splitDayExercises.id })
      .from(schema.splitDayExercises)
      .where(eq(schema.splitDayExercises.exerciseId, id))
      .limit(1),
    db
      .select({ id: schema.setLogs.id })
      .from(schema.setLogs)
      .where(eq(schema.setLogs.exerciseId, id))
      .limit(1),
  ]);
  if (planUse.length > 0) {
    throw new Error("Used in a split. Remove it from the plan first.");
  }
  if (logUse.length > 0) {
    throw new Error("This exercise has logged sets, so it keeps its history.");
  }
  await db
    .delete(schema.exercises)
    .where(
      and(eq(schema.exercises.id, id), eq(schema.exercises.isCustom, true)),
    )
    .run();
};

export interface LibraryExerciseRow {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  isCustom: boolean;
}

/** Exercise library rows, newest search first filtered by name. */
export const listExercises = async (
  term: string,
): Promise<LibraryExerciseRow[]> => {
  const rows = await getDb()
    .select({
      id: schema.exercises.id,
      name: schema.exercises.name,
      muscleGroup: schema.exercises.muscleGroup,
      equipment: schema.exercises.equipment,
      isCustom: schema.exercises.isCustom,
    })
    .from(schema.exercises)
    .where(term === "" ? undefined : like(schema.exercises.name, `%${term}%`))
    .limit(200);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscleGroup,
    equipment: row.equipment,
    isCustom: row.isCustom ?? false,
  }));
};
