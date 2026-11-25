import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import { dayKeyForTimestamp, parseDayKey, toDayKey } from "@/lib/day-key";
import { getDb } from "./client";
import * as schema from "./schema";
import {
  getActiveSplit,
  isRestDayRow,
  parseSchedule,
  weekdayKeyFor,
} from "./today";

export interface AdjacentDays {
  yesterdayName: string | null;
  yesterdayTrained: boolean;
  yesterdayIsRest: boolean;
  tomorrowName: string | null;
  tomorrowIsRest: boolean;
}

/**
 * The scheduled days either side of today. A rest day leaves the Today screen
 * with nothing to say, so it borrows what was done yesterday and what is next.
 *
 * Both the schedule lookup and the streak lookup have to agree on which day is
 * "today": streak history is keyed by the rollover-adjusted log day, so after
 * midnight but before the rollover hour the calendar day is still today.
 */
export const getAdjacentDays = async (
  rolloverHour = 6,
): Promise<AdjacentDays> => {
  const split = await getActiveSplit();
  const schedule = parseSchedule(split?.schedule ?? "{}");
  const today = parseDayKey(dayKeyForTimestamp(Date.now(), rolloverHour));
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  const yesterdayName = schedule[weekdayKeyFor(yesterday)] ?? null;
  const tomorrowName = schedule[weekdayKeyFor(tomorrow)] ?? null;

  const dayRows =
    split == null
      ? []
      : await getDb()
          .select({
            name: schema.splitDays.name,
            isRestDay: schema.splitDays.isRestDay,
          })
          .from(schema.splitDays)
          .where(eq(schema.splitDays.splitId, split.id));
  const isRest = (name: string | null) =>
    name != null && isRestDayRow(dayRows.find((row) => row.name === name));

  let yesterdayTrained = false;
  if (yesterdayName != null && !isRest(yesterdayName)) {
    const rows = await getDb()
      .select({ status: schema.streakHistory.status })
      .from(schema.streakHistory)
      .where(eq(schema.streakHistory.dayKey, toDayKey(yesterday)))
      .limit(1);
    yesterdayTrained = rows[0]?.status === "workout";
  }

  return {
    yesterdayName,
    yesterdayTrained,
    yesterdayIsRest: isRest(yesterdayName),
    tomorrowName,
    tomorrowIsRest: isRest(tomorrowName),
  };
};
