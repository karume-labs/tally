import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { FullBackup } from "./backup-types";

export const importBackup = async (
  backup: FullBackup,
  overwrite: boolean = true,
): Promise<void> => {
  if (backup.metadata.version !== 1) {
    throw new Error(`Unsupported backup version ${backup.metadata.version}`);
  }

  const db = getDb();
  const data = backup.data;

  if (overwrite) {
    await db.delete(schema.xpEvents);
    await db.delete(schema.streakHistory);
    await db.delete(schema.streakState);
    await db.delete(schema.setLogs);
    await db.delete(schema.sessions);
    await db.delete(schema.splitDayExercises);
    await db.delete(schema.splitDays);
    await db.delete(schema.splits);
    await db.delete(schema.exercises);
  }

  const idMap: Record<string, string> = {};

  const mapId = (id: string): string => {
    if (idMap[id]) return idMap[id];
    const newId = crypto.randomUUID();
    idMap[id] = newId;
    return newId;
  };

  const exercises = data.exercises.map((row) => ({
    ...row,
    id: mapId(row.id),
  }));
  const splits = data.splits.map((row) => ({ ...row, id: mapId(row.id) }));
  const splitDays = data.splitDays.map((row) => ({
    ...row,
    id: mapId(row.id),
  }));
  const sessions = data.sessions.map((row) => ({ ...row, id: mapId(row.id) }));
  const xpEvents = data.xpEvents.map((row) => ({ ...row, id: mapId(row.id) }));

  const exerciseIdMap = new Map(exercises.map((e) => [e.id, e.id]));
  const splitDayIdMap = new Map(splitDays.map((d) => [d.id, d.id]));
  const sessionIdMap = new Map(sessions.map((s) => [s.id, s.id]));

  const splitDayExercises = data.splitDayExercises.map((row) => ({
    ...row,
    id: mapId(row.id),
    splitDayId: splitDayIdMap.get(row.splitDayId) ?? mapId(row.splitDayId),
    exerciseId: exerciseIdMap.get(row.exerciseId) ?? mapId(row.exerciseId),
  }));

  const setLogs = data.setLogs.map((row) => ({
    ...row,
    id: mapId(row.id),
    sessionId: sessionIdMap.get(row.sessionId) ?? mapId(row.sessionId),
    exerciseId: exerciseIdMap.get(row.exerciseId) ?? mapId(row.exerciseId),
  }));

  const fixedSessions = sessions.map((row) => ({
    ...row,
    splitDayId:
      row.splitDayId != null
        ? (splitDayIdMap.get(row.splitDayId) ?? mapId(row.splitDayId))
        : null,
  }));

  const fixedStreakHistory = data.streakHistory.map((row) => ({
    ...row,
    sessionId:
      row.sessionId != null
        ? (sessionIdMap.get(row.sessionId) ?? mapId(row.sessionId))
        : null,
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

  // Empty arrays make drizzle throw ("No values to set"), and streak_state must
  // only be inserted once or the id=1 primary key collides.
  if (exercises.length > 0)
    await db.insert(schema.exercises).values(exercises).run();
  if (splits.length > 0) await db.insert(schema.splits).values(splits).run();
  if (splitDays.length > 0)
    await db.insert(schema.splitDays).values(splitDays).run();
  if (splitDayExercises.length > 0)
    await db.insert(schema.splitDayExercises).values(splitDayExercises).run();
  if (fixedSessions.length > 0)
    await db.insert(schema.sessions).values(fixedSessions).run();
  if (setLogs.length > 0) await db.insert(schema.setLogs).values(setLogs).run();
  if (fixedStreakState.length > 0)
    await db.insert(schema.streakState).values(fixedStreakState).run();
  if (fixedStreakHistory.length > 0)
    await db.insert(schema.streakHistory).values(fixedStreakHistory).run();
  if (xpEvents.length > 0)
    await db.insert(schema.xpEvents).values(xpEvents).run();
};
