import { addDays, startOfDay } from "date-fns";
import { toDayKey } from "@/lib/utils";
import type { DayDot } from "./streak-types";

export const last7DayDots = (
  history: Array<{ dayKey: string; status: string }>,
  loggedDayKey: string | null,
  isRestDay?: (dayKey: string) => boolean,
): DayDot[] => {
  const map = new Map(
    history.map((h) => [h.dayKey, h.status as DayDot["status"]]),
  );
  const dots: DayDot[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(startOfDay(new Date()), -i);
    const key = toDayKey(date);
    const status = map.get(key);
    if (status) {
      dots.push({ dayKey: key, status });
    } else if (loggedDayKey === key) {
      dots.push({ dayKey: key, status: "workout" });
    } else if (isRestDay?.(key) === true) {
      dots.push({ dayKey: key, status: "rest" });
    } else {
      dots.push({ dayKey: key, status: "missed" });
    }
  }
  return dots;
};
