import { dayKeyForTimestamp, toDayKey } from "@/lib/utils";
import type { ActiveSplitSchedule, TodayResult } from "./streak-types";

export const getTodayStatus = (
  schedule: ActiveSplitSchedule | null,
  isActive: boolean,
  rolloverHour: number = 6,
): TodayResult => {
  if (!isActive || !schedule) {
    return {
      dayKey: toDayKey(),
      status: "no-split",
      splitDayName: null,
      isRestDay: false,
    };
  }

  const now = new Date();
  const dayKey = dayKeyForTimestamp(now.getTime(), rolloverHour);
  const dayOfWeek = now.getDay();
  const weekdayKeys = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ] as const;
  const weekday = weekdayKeys[dayOfWeek];

  const splitDayName = schedule[weekday] ?? null;
  const isRestDay = splitDayName === "Rest" || splitDayName === "rest" || false;

  const status: "workout" | "rest" | "no-split" =
    splitDayName == null ? "no-split" : isRestDay ? "rest" : "workout";

  return { dayKey, status, splitDayName, isRestDay };
};
