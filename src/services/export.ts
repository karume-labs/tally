import { createMMKV } from "react-native-mmkv";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

const backupStorage = createMMKV({ id: "tally-backup" });

const BACKUP_KEY = "tally.backup";
const BACKUP_META_KEY = "tally.backup.meta";

export interface BackupMetadata {
  version: number;
  exportedAt: number;
  appVersion: string;
  recordCounts: Record<string, number>;
}

export interface FullBackup {
  metadata: BackupMetadata;
  data: {
    exercises: any[];
    splits: any[];
    splitDays: any[];
    splitDayExercises: any[];
    sessions: any[];
    setLogs: any[];
    streakState: any[];
    streakHistory: any[];
    xpEvents: any[];
  };
}

export const BACKUP_VERSION = 1;

// ─── Export ──────────────────────────────────────────────────────────────────────
export async function exportBackup(): Promise<FullBackup> {
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
}

export function getExportedMetadata(): BackupMetadata | null {
  const raw = backupStorage.getString(BACKUP_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackupMetadata;
  } catch {
    return null;
  }
}

// ─── Import ──────────────────────────────────────────────────────────────────────
export async function importBackup(
  backup: FullBackup,
  overwrite: boolean = true,
): Promise<void> {
  if (backup.metadata.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version ${backup.metadata.version}`);
  }

  const db = getDb();
  const data = backup.data as any;

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

  function mapId(id: string): string {
    if (idMap[id]) return idMap[id];
    const newId = crypto.randomUUID();
    idMap[id] = newId;
    return newId;
  }

  const exercises = (data.exercises as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));
  const splits = (data.splits as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));
  const splitDays = (data.splitDays as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));
  const sessions = (data.sessions as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));
  const streakHistory = (data.streakHistory as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));
  const xpEvents = (data.xpEvents as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
  }));

  const exerciseIdMap = new Map(
    exercises.map((e: any) => [e.id as string, e.id as string]),
  );
  const _splitIdMap = new Map(
    splits.map((s: any) => [s.id as string, s.id as string]),
  );
  const splitDayIdMap = new Map(
    splitDays.map((d: any) => [d.id as string, d.id as string]),
  );
  const sessionIdMap = new Map(
    sessions.map((s: any) => [s.id as string, s.id as string]),
  );

  const splitDayExercises = (data.splitDayExercises as any[]).map(
    (row: any) => ({
      ...row,
      id: mapId(row.id as string),
      splitDayId:
        splitDayIdMap.get(row.splitDayId as string) ??
        mapId(row.splitDayId as string),
      exerciseId:
        exerciseIdMap.get(row.exerciseId as string) ??
        mapId(row.exerciseId as string),
    }),
  );

  const setLogs = (data.setLogs as any[]).map((row: any) => ({
    ...row,
    id: mapId(row.id as string),
    sessionId:
      sessionIdMap.get(row.sessionId as string) ??
      mapId(row.sessionId as string),
    exerciseId:
      exerciseIdMap.get(row.exerciseId as string) ??
      mapId(row.exerciseId as string),
  }));

  const fixedSessions = sessions.map((row: any) => ({
    ...row,
    splitDayId:
      splitDayIdMap.get(row.splitDayId as string) ??
      mapId(row.splitDayId as string),
  }));

  const fixedStreakHistory = streakHistory.map((row: any) => ({
    ...row,
    sessionId:
      row.sessionId != null
        ? (sessionIdMap.get(row.sessionId as string) ??
          mapId(row.sessionId as string))
        : null,
  }));

  await db.insert(schema.exercises).values(exercises).run();
  await db.insert(schema.splits).values(splits).run();
  await db.insert(schema.splitDays).values(splitDays).run();
  await db.insert(schema.splitDayExercises).values(splitDayExercises).run();
  await db.insert(schema.sessions).values(fixedSessions).run();
  await db.insert(schema.setLogs).values(setLogs).run();
  await db.insert(schema.streakState).values(data.streakState).run();
  await db.insert(schema.streakHistory).values(fixedStreakHistory).run();
  await db.insert(schema.xpEvents).values(xpEvents).run();
}
