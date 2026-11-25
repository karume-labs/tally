import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { parseDayKey, toDayKey } from "@/lib/day-key";
import { syncStreakWidgetDots } from "@/services/sync-widget-dots";
import { type StreakRow, useStreakStore } from "@/stores/use-streak-store";

/**
 * The first day after the last logged day that has already passed, i.e. the
 * day a freeze can cover. Null when the chain is still unbroken.
 */
export const missedDayAfter = (lastLogDayKey: string | null): string | null => {
  if (lastLogDayKey == null) return null;
  const nextDay = toDayKey(addDays(parseDayKey(lastLogDayKey), 1));
  const yesterday = toDayKey(addDays(new Date(), -1));
  return nextDay <= yesterday ? nextDay : null;
};

/** Spends one freeze on the next missed day and keeps the streak chain alive. */
export const spendFreeze = async (): Promise<StreakRow> => {
  const row = useStreakStore.getState().row;
  if (row == null) throw new Error("Streak not loaded yet.");
  if (row.freezesAvailable <= 0) throw new Error("No freezes available.");
  const dayKey = missedDayAfter(row.lastLogDayKey);
  if (dayKey == null) throw new Error("No missed day to cover.");

  const db = getDb();
  await db
    .insert(schema.streakHistory)
    .values({ dayKey, status: "freeze", xpEarned: 0 })
    .onConflictDoUpdate({
      target: schema.streakHistory.dayKey,
      set: { status: "freeze" },
    })
    .run();
  await db
    .update(schema.streakState)
    .set({
      freezesAvailable: row.freezesAvailable - 1,
      freezesUsed: row.freezesUsed + 1,
      lastLogDayKey: dayKey,
    })
    .where(eq(schema.streakState.id, 1))
    .run();

  const next: StreakRow = {
    ...row,
    freezesAvailable: row.freezesAvailable - 1,
    freezesUsed: row.freezesUsed + 1,
    lastLogDayKey: dayKey,
  };
  useStreakStore.getState().setRow(next);
  await syncStreakWidgetDots(next.lastLogDayKey);
  return next;
};
