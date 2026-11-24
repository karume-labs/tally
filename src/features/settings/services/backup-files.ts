import { Directory, File } from "expo-file-system";
import type { FullBackup } from "@/services/backup-types";

const BACKUP_MIME = "application/json";
const DATA_KEYS = [
  "exercises",
  "splits",
  "splitDays",
  "splitDayExercises",
  "sessions",
  "setLogs",
  "streakState",
  "streakHistory",
  "xpEvents",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Guards against restoring a picker selection that is not a Tally backup. */
const isFullBackup = (value: unknown): value is FullBackup => {
  if (!isRecord(value)) return false;
  const { metadata, data } = value;
  if (!isRecord(metadata) || metadata.version !== 1) return false;
  if (!isRecord(data)) return false;
  return DATA_KEYS.every((key) => Array.isArray(data[key]));
};

export const parseBackupJson = (raw: string): FullBackup => {
  const parsed: unknown = JSON.parse(raw);
  if (!isFullBackup(parsed)) {
    throw new Error("This file is not a Tally backup.");
  }
  return parsed;
};

const fileNameFor = (exportedAt: number): string =>
  `tally-backup-${new Date(exportedAt).toISOString().slice(0, 10)}.json`;

/**
 * Saves the backup as a JSON file in a folder the user picks. Returns null when
 * the folder picker is dismissed; the backup is still kept in app storage.
 */
export const saveBackupToFile = async (
  backup: FullBackup,
): Promise<string | null> => {
  try {
    const directory = await Directory.pickDirectoryAsync();
    const file = directory.createFile(
      fileNameFor(backup.metadata.exportedAt),
      BACKUP_MIME,
    );
    file.write(JSON.stringify(backup));
    return file.uri;
  } catch {
    return null;
  }
};

export const pickBackupFile = async (): Promise<FullBackup | null> => {
  const picked = await File.pickFileAsync({ mimeTypes: BACKUP_MIME });
  if (picked.canceled) return null;
  return parseBackupJson(await picked.result.text());
};
