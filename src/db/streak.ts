import { eq } from "drizzle-orm";
import type { StreakRow } from "@/stores/use-streak-store";
import { getDb } from "./client";
import * as schema from "./schema";

/**
 * Reads the single streak_state row into the shape the streak store expects.
 * Without this the UI only ever shows a streak after a workout finishes in the
 * same app session, so a relaunch would look like a lost streak.
 */
export const loadStreakRow = async (): Promise<StreakRow | null> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.streakState)
    .where(eq(schema.streakState.id, 1))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    currentStreak: row.currentStreak ?? 0,
    longestStreak: row.longestStreak ?? 0,
    lastLogDayKey: row.lastLogDayKey,
    freezesAvailable: row.freezesAvailable ?? 0,
    freezesUsed: row.freezesUsed ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    totalSessions: row.totalSessions ?? 0,
    totalVolume: row.totalVolume ?? 0,
  };
};
