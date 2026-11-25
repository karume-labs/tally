import { getAdjacentDays } from "@/db/split-days";
import { getTodayExercises, getTodayInfo } from "@/db/today";
import { writeTodayWidgetData } from "./widgetSync";

/**
 * Repaints the Today widget from the database. The widget renders headlessly,
 * so everything it shows has to be written to MMKV while the app is alive.
 */
export const syncTodayWidget = async (sessionActive = false) => {
  const [info, exercises, adjacent] = await Promise.all([
    getTodayInfo(),
    getTodayExercises(),
    getAdjacentDays(),
  ]);

  writeTodayWidgetData({
    dayName: info?.dayName ?? null,
    tomorrowDayName: adjacent.tomorrowName,
    exerciseCount: exercises?.length ?? 0,
    exerciseNames: exercises?.map((exercise) => exercise.name) ?? [],
    isRestDay: info?.isRestDay ?? false,
    sessionActive,
    updatedAt: Date.now(),
  });
};
