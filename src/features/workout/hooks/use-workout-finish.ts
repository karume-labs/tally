import { eq } from "drizzle-orm";
import { useCallback } from "react";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  getActiveSplit,
  getTodayExercises,
  parseSchedule,
  todaySplitDayName,
} from "@/db/today";
import { useWorkoutSession } from "@/features/workout/hooks/use-workout-session";
import { calculateSessionXP, calculateStreak } from "@/services/streak";
import { syncStreakWidgetDots } from "@/services/sync-widget-dots";
import {
  writeStreakWidgetData,
  writeTodayWidgetData,
} from "@/services/widgetSync";
import { useStreakStore } from "@/stores/use-streak-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

export const useWorkoutFinish = () => {
  const store = useWorkoutStore();
  const session = useWorkoutSession();
  const streak = useStreakStore((s) => s.row);
  const addXP = useStreakStore((s) => s.addXP);
  const logWorkoutDay = useStreakStore((s) => s.logWorkoutDay);
  const refreshMilestones = useStreakStore((s) => s.refreshMilestones);

  return useCallback(async () => {
    if (!store.sessionId) return;
    const result = session.finishSession();

    const xpResult = calculateSessionXP(50, result.prCount, 0, 0);
    const dayKey =
      todaySplitDayName(
        parseSchedule((await getActiveSplit())?.schedule ?? "{}"),
      ) ?? "";
    if (dayKey) {
      const streakResult = calculateStreak(
        streak?.currentStreak ?? 0,
        streak?.longestStreak ?? 0,
        streak?.lastLogDayKey ?? null,
        dayKey,
        "workout",
        6,
      );
      if (streakResult.streakChanged || result.prCount > 0) {
        const db = getDb();
        await db
          .update(schema.streakState)
          .set({
            currentStreak: streakResult.newCurrentStreak,
            longestStreak: streakResult.newLongestStreak,
            lastLogDayKey: dayKey,
            xp: (streak?.xp ?? 0) + xpResult.totalXP,
            level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
            totalSessions: (streak?.totalSessions ?? 0) + 1,
            totalVolume: (streak?.totalVolume ?? 0) + result.totalVolume,
          })
          .where(eq(schema.streakState.id, 1))
          .run();

        useStreakStore.getState().setRow({
          id: 1,
          currentStreak: streakResult.newCurrentStreak,
          longestStreak: streakResult.newLongestStreak,
          lastLogDayKey: dayKey,
          freezesAvailable: streak?.freezesAvailable ?? 0,
          freezesUsed: streak?.freezesUsed ?? 0,
          xp: (streak?.xp ?? 0) + xpResult.totalXP,
          level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
          totalSessions: (streak?.totalSessions ?? 0) + 1,
          totalVolume: (streak?.totalVolume ?? 0) + result.totalVolume,
        });

        addXP(
          xpResult.totalXP,
          "session_complete",
          `Workout complete — ${result.durationSeconds}s`,
          crypto.randomUUID(),
        );
        logWorkoutDay(dayKey, xpResult.totalXP, store.sessionId, "workout");
        refreshMilestones();

        writeStreakWidgetData({
          current: streakResult.newCurrentStreak,
          longest: streakResult.newLongestStreak,
          level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
          xp: (streak?.xp ?? 0) + xpResult.totalXP,
          updatedAt: Date.now(),
        });
        await syncStreakWidgetDots(dayKey);
      }
    }

    const exercises = await getTodayExercises();
    writeTodayWidgetData({
      dayName:
        todaySplitDayName(
          parseSchedule((await getActiveSplit())?.schedule ?? "{}"),
        ) ?? null,
      exerciseCount: exercises?.length ?? 0,
      exerciseNames: exercises?.map((e) => e.name) ?? [],
      isRestDay: false,
      sessionActive: false,
      updatedAt: Date.now(),
    });
  }, [store, session, streak, addXP, logWorkoutDay, refreshMilestones]);
};
