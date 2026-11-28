import type { FullBackup } from "./backup-types";

// JSON has no date type, so a backup read back from disk carries timestamps as
// ISO strings. Drizzle's `timestamp` columns call Date methods on the value, so
// inserting the parsed strings throws "undefined is not a function".
type DateLike = Date | string | number | null;

const toDate = (value: DateLike, field: string): Date => {
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Backup has an unreadable ${field}`);
  }
  return date;
};

const toNullableDate = (value: DateLike, field: string): Date | null =>
  value == null ? null : toDate(value, field);

/** Turns every serialized timestamp in a backup back into a Date. */
export const reviveBackupDates = (
  data: FullBackup["data"],
): FullBackup["data"] => ({
  ...data,
  exercises: data.exercises.map((row) => ({
    ...row,
    createdAt: toDate(row.createdAt, "exercise date"),
  })),
  splits: data.splits.map((row) => ({
    ...row,
    createdAt: toDate(row.createdAt, "split date"),
    updatedAt: toDate(row.updatedAt, "split date"),
  })),
  sessions: data.sessions.map((row) => ({
    ...row,
    startedAt: toDate(row.startedAt, "session start"),
    endedAt: toNullableDate(row.endedAt, "session end"),
  })),
  setLogs: data.setLogs.map((row) => ({
    ...row,
    completedAt: toDate(row.completedAt, "set date"),
  })),
  xpEvents: data.xpEvents.map((row) => ({
    ...row,
    createdAt: toDate(row.createdAt, "XP event date"),
  })),
});
