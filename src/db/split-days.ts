import { addDays, startOfDay } from "date-fns";
import { eq } from "drizzle-orm";
import { getDb } from "./client";
import * as schema from "./schema";
import {
  getActiveSplit,
  parseSchedule,
  type TodayExercise,
  weekdayKeyFor,
} from "./today";

export interface SplitDayOption {
  id: string;
  name: string;
  isRestDay: boolean;
  exerciseCount: number;
}

/** Every day template in a split, with how many exercises it holds. */
export const listSplitDays = async (
  splitId: string,
): Promise<SplitDayOption[]> => {
  const db = getDb();
  const days = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId))
    .orderBy(schema.splitDays.dayOrder);

  const options: SplitDayOption[] = [];
  for (const day of days) {
    const links = await db
      .select({ id: schema.splitDayExercises.id })
      .from(schema.splitDayExercises)
      .where(eq(schema.splitDayExercises.splitDayId, day.id));
    options.push({
      id: day.id,
      name: day.name,
      isRestDay: day.isRestDay ?? false,
      exerciseCount: links.length,
    });
  }
  return options;
};

/** The first non-rest day of the active split — the fallback "extra" session. */
export const listTrainableDays = async (): Promise<SplitDayOption[]> => {
  const split = await getActiveSplit();
  if (!split) return [];
  const days = await listSplitDays(split.id);
  return days.filter((day) => !day.isRestDay && day.exerciseCount > 0);
};

export const getSplitDayById = async (
  dayId: string,
): Promise<{ id: string; name: string; isRestDay: boolean } | null> => {
  const rows = await getDb()
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.id, dayId))
    .limit(1);
  const day = rows[0];
  if (!day) return null;
  return { id: day.id, name: day.name, isRestDay: day.isRestDay ?? false };
};

export const loadExercisesForSplitDay = async (
  splitDayId: string,
): Promise<TodayExercise[]> => {
  const db = getDb();
  const sdeRows = await db
    .select()
    .from(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, splitDayId))
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
  return exercises;
};

export interface AdjacentDays {
  yesterdayName: string | null;
  yesterdayTrained: boolean;
  tomorrowName: string | null;
}

/**
 * The scheduled days either side of today. A rest day leaves the Today screen
 * with nothing to say, so it borrows what was done yesterday and what is next.
 */
export const getAdjacentDays = async (): Promise<AdjacentDays> => {
  const split = await getActiveSplit();
  const schedule = parseSchedule(split?.schedule ?? "{}");
  const today = startOfDay(new Date());
  const yesterdayKey = weekdayKeyFor(addDays(today, -1));
  const tomorrowKey = weekdayKeyFor(addDays(today, 1));

  const yesterdayName = schedule[yesterdayKey] ?? null;
  const tomorrowName = schedule[tomorrowKey] ?? null;

  let yesterdayTrained = false;
  if (yesterdayName != null && yesterdayName.toLowerCase() !== "rest") {
    const rows = await getDb()
      .select({ status: schema.streakHistory.status })
      .from(schema.streakHistory)
      .where(eq(schema.streakHistory.dayKey, yesterdayKeyToKey(today)))
      .limit(1);
    yesterdayTrained = rows[0]?.status === "workout";
  }

  return { yesterdayName, yesterdayTrained, tomorrowName };
};

const yesterdayKeyToKey = (today: Date): string => {
  const date = addDays(today, -1);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};
