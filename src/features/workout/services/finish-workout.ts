import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { MAX_FREEZES, XP_PER_LEVEL, XP_VALUES } from "@/lib/constants";
import { createId, dayKeyForTimestamp } from "@/lib/utils";
import {
  calculateSessionXP,
  calculateStreak,
  last7DayDots,
} from "@/services/streak";
import {
  writeLast7Dots,
  writeStreakWidgetData,
  writeTodayWidgetData,
} from "@/services/widgetSync";
import { useStreakStore } from "@/stores/use-streak-store";

interface FinishWorkoutInput {
  sessionId: string;
  result: {
    durationSeconds: number;
    totalVolume: number;
    completedSets: number;
    prCount: number;
  };
  rolloverHour: number;
  todayInfo: { dayName: string | null; isRest: boolean };
  exerciseNames: string[];
}

/** Persists everything a finished session changes, then updates the widgets. */
export const finishWorkout = async ({
  sessionId,
  result,
  rolloverHour,
  todayInfo,
  exerciseNames,
}: FinishWorkoutInput) => {
  const streak = useStreakStore.getState().row;
  const xpResult = calculateSessionXP(
    XP_VALUES.sessionComplete,
    result.prCount,
  );
  const dayKey = dayKeyForTimestamp(Date.now(), rolloverHour);
  const streakResult = calculateStreak(
    streak?.currentStreak ?? 0,
    streak?.longestStreak ?? 0,
    streak?.lastLogDayKey ?? null,
    dayKey,
    "workout",
    rolloverHour,
  );
  const newXP = (streak?.xp ?? 0) + xpResult.totalXP;
  const nextRow = {
    id: 1,
    currentStreak: streakResult.newCurrentStreak,
    longestStreak: streakResult.newLongestStreak,
    lastLogDayKey: dayKey,
    freezesAvailable: Math.min(
      MAX_FREEZES,
      (streak?.freezesAvailable ?? 0) + (streakResult.earnedFreeze ? 1 : 0),
    ),
    freezesUsed: streak?.freezesUsed ?? 0,
    xp: newXP,
    level: Math.floor(newXP / XP_PER_LEVEL) + 1,
    totalSessions: (streak?.totalSessions ?? 0) + 1,
    totalVolume: (streak?.totalVolume ?? 0) + result.totalVolume,
  };

  const db = getDb();
  await db
    .update(schema.streakState)
    .set({
      currentStreak: nextRow.currentStreak,
      longestStreak: nextRow.longestStreak,
      lastLogDayKey: nextRow.lastLogDayKey,
      freezesAvailable: nextRow.freezesAvailable,
      freezesUsed: nextRow.freezesUsed,
      xp: nextRow.xp,
      level: nextRow.level,
      totalSessions: nextRow.totalSessions,
      totalVolume: nextRow.totalVolume,
    })
    .where(eq(schema.streakState.id, 1))
    .run();

  // A second workout on the same day updates the existing day instead of
  // failing on the primary key.
  await db
    .insert(schema.streakHistory)
    .values({
      dayKey,
      status: "workout",
      sessionId,
      xpEarned: xpResult.totalXP,
    })
    .onConflictDoUpdate({
      target: schema.streakHistory.dayKey,
      set: {
        status: "workout",
        sessionId,
        xpEarned: xpResult.totalXP,
      },
    })
    .run();

  await db
    .insert(schema.xpEvents)
    .values({
      id: createId(),
      eventType: "session_complete",
      xpAmount: xpResult.totalXP,
      description: `Workout complete — ${result.durationSeconds}s`,
      createdAt: new Date(),
    })
    .run();

  useStreakStore.getState().setRow(nextRow);
  useStreakStore.getState().refreshMilestones();

  writeStreakWidgetData({
    current: nextRow.currentStreak,
    longest: nextRow.longestStreak,
    level: nextRow.level,
    xp: nextRow.xp,
    updatedAt: Date.now(),
  });
  writeLast7Dots(last7DayDots([{ dayKey, status: "workout" }], dayKey));
  writeTodayWidgetData({
    dayName: todayInfo.dayName,
    exerciseCount: exerciseNames.length,
    exerciseNames,
    isRestDay: todayInfo.isRest,
    sessionActive: false,
    updatedAt: Date.now(),
  });
};
