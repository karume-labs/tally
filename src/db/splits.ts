import { eq } from "drizzle-orm";
import { createId } from "@/lib/utils";
import { getDb } from "./client";
import * as schema from "./schema";

export interface SplitDayInput {
  id?: string;
  name: string;
  exercises: SplitDayExerciseInput[];
}

export interface SplitDayExerciseInput {
  exerciseId: string;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number;
  supersetGroup: string | null;
}

export interface SplitInput {
  name: string;
  description: string;
  days: SplitDayInput[];
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * The weekly schedule a hand-built split uses: its day templates cycle across
 * Monday–Sunday. Rest is the absence of a day, not a row, unless the user adds
 * a day literally named "Rest" — which is treated as a rest day everywhere.
 */
export const buildSchedule = (dayNames: string[]): Record<string, string> => {
  const schedule: Record<string, string> = {};
  if (dayNames.length === 0) return schedule;
  for (let i = 0; i < WEEKDAYS.length; i++) {
    schedule[WEEKDAYS[i]] = dayNames[i % dayNames.length];
  }
  return schedule;
};

const replaceDayExercises = async (dayId: string, day: SplitDayInput) => {
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

export const createSplit = async (input: SplitInput): Promise<string> => {
  const db = getDb();
  const now = new Date();
  const splitId = createId();
  await db
    .insert(schema.splits)
    .values({
      id: splitId,
      name: input.name,
      description: input.description,
      isPreset: false,
      isActive: false,
      schedule: JSON.stringify(
        buildSchedule(input.days.map((day) => day.name)),
      ),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  for (const [index, day] of input.days.entries()) {
    const dayId = createId();
    await db
      .insert(schema.splitDays)
      .values({
        id: dayId,
        splitId,
        name: day.name,
        dayOrder: index,
        isRestDay: day.name.toLowerCase() === "rest",
      })
      .run();
    await replaceDayExercises(dayId, day);
  }

  return splitId;
};

export const updateSplit = async (
  splitId: string,
  input: SplitInput,
): Promise<void> => {
  const db = getDb();
  await db
    .update(schema.splits)
    .set({
      name: input.name,
      description: input.description,
      schedule: JSON.stringify(
        buildSchedule(input.days.map((day) => day.name)),
      ),
      updatedAt: new Date(),
    })
    .where(eq(schema.splits.id, splitId))
    .run();

  const existingDays = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId));
  const keptIds = new Set(input.days.map((day) => day.id).filter(Boolean));

  // Days that still own a logged session cannot be deleted (the FK pins them);
  // they are left in place so the history keeps its label.
  for (const existing of existingDays) {
    if (keptIds.has(existing.id)) continue;
    const used = await db
      .select({ id: schema.sessions.id })
      .from(schema.sessions)
      .where(eq(schema.sessions.splitDayId, existing.id))
      .limit(1);
    if (used.length > 0) continue;
    await db
      .delete(schema.splitDays)
      .where(eq(schema.splitDays.id, existing.id))
      .run();
  }

  for (const [index, day] of input.days.entries()) {
    const isRestDay = day.name.toLowerCase() === "rest";
    if (day.id != null && existingDays.some((row) => row.id === day.id)) {
      await db
        .update(schema.splitDays)
        .set({ name: day.name, dayOrder: index, isRestDay })
        .where(eq(schema.splitDays.id, day.id))
        .run();
      await replaceDayExercises(day.id, day);
      continue;
    }
    const dayId = createId();
    await db
      .insert(schema.splitDays)
      .values({
        id: dayId,
        splitId,
        name: day.name,
        dayOrder: index,
        isRestDay,
      })
      .run();
    await replaceDayExercises(dayId, day);
  }
};

export const deleteSplit = async (splitId: string): Promise<void> => {
  const db = getDb();
  const rows = await db
    .select({ isActive: schema.splits.isActive })
    .from(schema.splits)
    .where(eq(schema.splits.id, splitId))
    .limit(1);
  if (rows[0]?.isActive === true) {
    throw new Error("Set another split as active before deleting this one.");
  }

  const days = await db
    .select({ id: schema.splitDays.id })
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId));
  for (const day of days) {
    const used = await db
      .select({ id: schema.sessions.id })
      .from(schema.sessions)
      .where(eq(schema.sessions.splitDayId, day.id))
      .limit(1);
    if (used.length > 0) {
      throw new Error(
        "This split has logged workouts. Archive it by making another split active instead.",
      );
    }
  }

  // split_days and split_day_exercises cascade from the split row.
  await db.delete(schema.splits).where(eq(schema.splits.id, splitId)).run();
};
