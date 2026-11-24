import { loadRecentHistory } from "@/db/streak-history";
import { getActiveSplit, parseSchedule, weekdayKeyFor } from "@/db/today";
import { parseDayKey } from "@/lib/utils";
import { last7DayDots } from "./day-dots";
import { writeLast7Dots } from "./widgetSync";

/**
 * Persists the streak widget's 7-day dots from real history so the widget
 * matches the app when it renders headlessly. Days without a history row fall
 * back to the active split's schedule, which is where rest days live.
 */
export const syncStreakWidgetDots = async (loggedDayKey: string | null) => {
  const history = await loadRecentHistory(7);
  const split = await getActiveSplit();
  const schedule = parseSchedule(split?.schedule ?? "{}");
  const restWeekdays = new Set(
    Object.entries(schedule)
      .filter(([, dayName]) => dayName.toLowerCase() === "rest")
      .map(([weekday]) => weekday),
  );

  writeLast7Dots(
    last7DayDots(history, loggedDayKey, (dayKey) =>
      restWeekdays.has(weekdayKeyFor(parseDayKey(dayKey))),
    ),
  );
};
