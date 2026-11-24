import { parseSchedule } from "@/db/today";

export const WEEKDAY_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export interface ScheduledDay {
  weekday: string;
  dayName: string;
}

/** The split's stored schedule as ordered weekday entries. */
export const weekSchedule = (schedule: string): ScheduledDay[] => {
  const parsed = parseSchedule(schedule);
  const days: ScheduledDay[] = [];
  for (const weekday of WEEKDAY_ORDER) {
    const dayName = parsed[weekday];
    if (dayName != null && dayName !== "") {
      days.push({ weekday, dayName });
    }
  }
  return days;
};
