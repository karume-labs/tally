import { REST_DAY_NAME } from "@/db/seed-plan";
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

/**
 * Days actually trained each week, from the schedule rather than the day list.
 * StrongLifts has two day templates but trains three times, so counting
 * templates would understate the plan.
 */
export const trainingDaysPerWeek = (schedule: string): number =>
  weekSchedule(schedule).filter((day) => day.dayName !== REST_DAY_NAME).length;
