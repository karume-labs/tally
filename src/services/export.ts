import { createMMKV } from "react-native-mmkv";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { BackupMetadata, FullBackup } from "./backup-types";

const backupStorage = createMMKV({ id: "tally-backup" });

const BACKUP_KEY = "tally.backup";
const BACKUP_META_KEY = "tally.backup.meta";

export const BACKUP_VERSION = 1;

export const exportBackup = async (): Promise<FullBackup> => {
  const db = getDb();

  const [
    exercises,
    splits,
    splitDays,
    splitDayExercises,
    sessions,
    setLogs,
    streakState,
    streakHistory,
    xpEvents,
  ] = await Promise.all([
    db.select().from(schema.exercises),
    db.select().from(schema.splits),
    db.select().from(schema.splitDays),
    db.select().from(schema.splitDayExercises),
    db.select().from(schema.sessions),
    db.select().from(schema.setLogs),
    db.select().from(schema.streakState),
    db.select().from(schema.streakHistory),
    db.select().from(schema.xpEvents),
  ]);

  const metadata: BackupMetadata = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    appVersion: "1.0.0",
    recordCounts: {
      exercises: exercises.length,
      splits: splits.length,
      splitDays: splitDays.length,
      splitDayExercises: splitDayExercises.length,
      sessions: sessions.length,
      setLogs: setLogs.length,
      streakState: streakState.length,
      streakHistory: streakHistory.length,
      xpEvents: xpEvents.length,
    },
  };

  const backup: FullBackup = {
    metadata,
    data: {
      exercises,
      splits,
      splitDays,
      splitDayExercises,
      sessions,
      setLogs,
      streakState,
      streakHistory,
      xpEvents,
    },
  };

  try {
    backupStorage.set(BACKUP_KEY, JSON.stringify(backup));
    backupStorage.set(BACKUP_META_KEY, JSON.stringify(metadata));
  } catch (err) {
    console.warn("[tally.export] mmkv persist failed:", err);
  }

  return backup;
};

export const getExportedMetadata = (): BackupMetadata | null => {
  const raw = backupStorage.getString(BACKUP_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackupMetadata;
  } catch {
    return null;
  }
};
