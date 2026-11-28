import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { createId } from "@/lib/utils";
import { reviveBackupDates } from "./backup-dates";
import type { FullBackup } from "./backup-types";

export const importBackup = async (
  backup: FullBackup,
  overwrite: boolean = true,
): Promise<void> => {
  if (backup.metadata.version !== 1) {
    throw new Error(`Unsupported backup version ${backup.metadata.version}`);
  }

  const db = getDb();
  const data = reviveBackupDates(backup.data);

  // Ids are remapped so restoring a backup onto a database that already has a
  // row with the same id cannot collide. createId works on Hermes, where
  // crypto.randomUUID is not available.
  const idMap: Record<string, string> = {};
  const mapId = (id: string): string => {
    idMap[id] ??= createId();
    return idMap[id];
  };

  const exercises = data.exercises.map((row) => ({
    ...row,
    id: mapId(row.id),
  }));
  const splits = data.splits.map((row) => ({ ...row, id: mapId(row.id) }));
  const splitDays = data.splitDays.map((row) => ({
    ...row,
    id: mapId(row.id),
    splitId: mapId(row.splitId),
  }));
  const sessions = data.sessions.map((row) => ({
    ...row,
    id: mapId(row.id),
    splitDayId: row.splitDayId != null ? (idMap[row.splitDayId] ?? null) : null,
  }));
  const xpEvents = data.xpEvents.map((row) => ({ ...row, id: mapId(row.id) }));

  const splitDayExercises = data.splitDayExercises.map((row) => ({
    ...row,
    id: mapId(row.id),
    splitDayId: mapId(row.splitDayId),
    exerciseId: mapId(row.exerciseId),
  }));

  const setLogs = data.setLogs.map((row) => ({
    ...row,
    id: mapId(row.id),
    sessionId: mapId(row.sessionId),
    exerciseId: mapId(row.exerciseId),
  }));

  const fixedStreakHistory = data.streakHistory.map((row) => ({
    ...row,
    sessionId: row.sessionId != null ? (idMap[row.sessionId] ?? null) : null,
  }));

  const fixedStreakState = data.streakState.map((row) => ({
    ...row,
    currentStreak: row.currentStreak ?? 0,
    longestStreak: row.longestStreak ?? 0,
    freezesAvailable: row.freezesAvailable ?? 0,
    freezesUsed: row.freezesUsed ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    totalSessions: row.totalSessions ?? 0,
    totalVolume: row.totalVolume ?? 0,
  }));

  // A restore either replaces everything or leaves the database untouched: the
  // old data was deleted before the inserts, so a failure halfway through used
  // to wipe the user's workouts. The expo-sqlite driver commits as soon as the
  // callback returns, so the callback must be synchronous — every statement in
  // it executes immediately, and a throw rolls the whole restore back.
  db.transaction((tx) => {
    if (overwrite) {
      tx.delete(schema.xpEvents).run();
      tx.delete(schema.streakHistory).run();
      tx.delete(schema.streakState).run();
      tx.delete(schema.setLogs).run();
      tx.delete(schema.sessions).run();
      tx.delete(schema.splitDayExercises).run();
      tx.delete(schema.splitDays).run();
      tx.delete(schema.splits).run();
      tx.delete(schema.exercises).run();
    }

    // Empty arrays make drizzle throw ("No values to set"), and streak_state
    // must only be inserted once or the id=1 primary key collides.
    if (exercises.length > 0) {
      tx.insert(schema.exercises).values(exercises).run();
    }
    if (splits.length > 0) {
      tx.insert(schema.splits).values(splits).run();
    }
    if (splitDays.length > 0) {
      tx.insert(schema.splitDays).values(splitDays).run();
    }
    if (splitDayExercises.length > 0) {
      tx.insert(schema.splitDayExercises).values(splitDayExercises).run();
    }
    if (sessions.length > 0) {
      tx.insert(schema.sessions).values(sessions).run();
    }
    if (setLogs.length > 0) {
      tx.insert(schema.setLogs).values(setLogs).run();
    }
    if (fixedStreakState.length > 0) {
      tx.insert(schema.streakState).values(fixedStreakState).run();
    }
    if (fixedStreakHistory.length > 0) {
      tx.insert(schema.streakHistory).values(fixedStreakHistory).run();
    }
    if (xpEvents.length > 0) {
      tx.insert(schema.xpEvents).values(xpEvents).run();
    }
  });
};
