import { addDays, startOfDay } from "date-fns";
import { gte } from "drizzle-orm";
import { toDayKey } from "@/lib/day-key";
import { getDb } from "./client";
import * as schema from "./schema";

/** Streak history rows for the last `days` calendar days, oldest key first. */
export const loadRecentHistory = async (days = 7) => {
  const db = getDb();
  const fromKey = toDayKey(addDays(startOfDay(new Date()), -(days - 1)));
  const rows = await db
    .select()
    .from(schema.streakHistory)
    .where(gte(schema.streakHistory.dayKey, fromKey));
  return rows.sort((a, b) => a.dayKey.localeCompare(b.dayKey));
};
