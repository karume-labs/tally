import { getDay, startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  getExercisesForDay,
  loadDayExercises,
  type TodayExercise,
} from "./day-exercises";
import * as schema from "./schema";

export type { TodayExercise };

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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

  const rows = await getDb()
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

/** A split day's exercises, for callers that already hold its row id. */
export const getSplitDayExercises = loadDayExercises;
