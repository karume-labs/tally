import { parseISO, startOfDay } from "date-fns";

// ─── Day keys ────────────────────────────────────────────────────────────────────
// Day keys are calendar days in the device's zone. Using toISOString() here
// would shift the key by a day for any timezone east of UTC.
const formatLocalDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toDayKey = (date: Date = new Date()): string =>
  formatLocalDayKey(startOfDay(date));

export const parseDayKey = (key: string): Date => parseISO(key);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─── Day rollover ────────────────────────────────────────────────────────────────
/**
 * Returns the "log day key" for a timestamp given the user's rollover hour.
 * Night owls whose day starts at 6am: a workout at 2am counts toward the
 * previous calendar day's streak.
 */
export const dayKeyForTimestamp = (
  unixMs: number,
  rolloverHour = 6,
): string => {
  const date = new Date(unixMs);
  const local = startOfDay(date);
  const hour = date.getHours();
  if (hour < rolloverHour) {
    local.setDate(local.getDate() - 1);
  }
  return formatLocalDayKey(local);
};
