import { getDay, startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import * as schema from "./schema";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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

/** Returns the currently-active split, or null. */
export const getActiveSplit = async () => {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.splits)
    .where(eq(schema.splits.isActive, true))
    .limit(1);
  return rows[0] ?? null;
};

/** Parses a split's `schedule` JSON into { weekday: dayName }. */
export const parseSchedule = (raw: string): Record<string, string> => {
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

/**
 * Rest is a stored flag on the day. The name check only covers rows written
 * before the flag was editable, when naming a day "Rest" was the only way.
 */
export const isRestDayRow = (
  day: { name: string; isRestDay: boolean | null } | undefined,
): boolean =>
  day != null &&
  (day.isRestDay === true || day.name.trim().toLowerCase() === "rest");

/** Weekday key ("mon", "tue", …) for a date, using the same keys as the schedule. */
export const weekdayKeyFor = (date: Date): (typeof WEEKDAY_KEYS)[number] =>
  WEEKDAY_KEYS[getDay(startOfDay(date))];

/** Returns the split-day name assigned to today (locale weekday), or null. */
export const todaySplitDayName = (
  schedule: Record<string, string> | null,
): string | null => {
  if (!schedule) return null;
  const dayIndex = getDay(startOfDay(new Date())); // 0=Sun
  const key = WEEKDAY_KEYS[dayIndex];
  return schedule[key] ?? null;
};

/** Returns a split day's ordered exercise list by split id + day name, or [] when the day has no rows. */
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
  if (sdeRows.length === 0) return [];

  // Fetch each exercise by id. For a small list this is fine; we could batch
  // with `inArray` later if needed.
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

  return exercises.sort(
    (a: TodayExercise, b: TodayExercise) => a.order - b.order,
  );
};

/** Returns today's ordered exercise list for the active split, or null if no active split / no today. */
export const getTodayExercises = async (): Promise<TodayExercise[] | null> => {
  const split = await getActiveSplit();
  if (!split) return null;

  const schedule = parseSchedule(split.schedule);
  const dayName = todaySplitDayName(schedule);
  if (!dayName) return null;

  return getExercisesForDay(split.id, dayName);
};

/**
 * Returns the row id for today's split day. Sessions link to split_days, so
 * passing the split id here would violate the foreign key.
 */
export const getTodaySplitDay = async (): Promise<{
  id: string;
  name: string;
  isRestDay: boolean;
} | null> => {
  const split = await getActiveSplit();
  if (!split) return null;
  const dayName = todaySplitDayName(parseSchedule(split.schedule));
  if (!dayName) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.splitDays)
    .where(
      and(
        eq(schema.splitDays.splitId, split.id),
        eq(schema.splitDays.name, dayName),
      ),
    )
    .limit(1);
  const day = rows[0];
  if (!day) return null;
  return {
    id: day.id,
    name: day.name,
    isRestDay: isRestDayRow(day),
  };
};

/** Returns today's split-day name + isRestDay for the active split, or null. */
export const getTodayInfo = async (): Promise<{
  dayName: string | null;
  isRestDay: boolean;
  schedule: Record<string, string> | null;
} | null> => {
  const split = await getActiveSplit();
  if (!split) return null;
  const schedule = parseSchedule(split.schedule);
  const dayName = todaySplitDayName(schedule);
  if (dayName == null) return { dayName, isRestDay: false, schedule };

  const rows = await getDb()
    .select({
      name: schema.splitDays.name,
      isRestDay: schema.splitDays.isRestDay,
    })
    .from(schema.splitDays)
    .where(
      and(
        eq(schema.splitDays.splitId, split.id),
        eq(schema.splitDays.name, dayName),
      ),
    )
    .limit(1);

  return { dayName, isRestDay: isRestDayRow(rows[0]), schedule };
};
