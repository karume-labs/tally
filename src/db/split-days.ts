import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { loadDayExercises, type TodayExercise } from "./day-exercises";
import * as schema from "./schema";
import { getActiveSplit, isRestDayRow } from "./today";

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
      isRestDay: isRestDayRow(day),
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
  return { id: day.id, name: day.name, isRestDay: isRestDayRow(day) };
};

export const loadExercisesForSplitDay = async (
  splitDayId: string,
): Promise<TodayExercise[]> => loadDayExercises(splitDayId);
