import { useRouter } from "expo-router";
import { Download, Upload } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { seed } from "@/db/seed";
import { loadStreakRow } from "@/db/streak";
import {
  pickBackupFile,
  saveBackupToFile,
} from "@/features/settings/services/backup-files";
import type { FullBackup } from "@/services/backup-types";
import { exportBackup, getExportedMetadata } from "@/services/export";
import { importBackup } from "@/services/import";
import { useStreakStore } from "@/stores/use-streak-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

const formatWhen = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();

const sessionCount = (backup: FullBackup): number =>
  backup.metadata.recordCounts.sessions ?? 0;

export const BackupSection = () => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(() => {
    const metadata = getExportedMetadata();
    return metadata ? `Last backup ${formatWhen(metadata.exportedAt)}` : null;
  });

  const onExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const backup = await exportBackup();
      const uri = await saveBackupToFile(backup);
      setStatus(
        uri == null
          ? `Backup kept in the app (${sessionCount(backup)} sessions)`
          : `Saved ${sessionCount(backup)} sessions to a file`,
      );
    } catch (err) {
      console.warn("[tally.backup] export failed:", err);
      setStatus("Export failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const runImport = async (backup: FullBackup) => {
    setBusy(true);
    try {
      await importBackup(backup, true);
      // A backup can carry outlines such as a preset's old seven-day schedule;
      // re-running the seed applies the same fixes a fresh launch would.
      await seed();
      const row = await loadStreakRow();
      if (row != null) useStreakStore.getState().setRow(row);
      useWorkoutStore.getState().reset();
      setStatus(`Restored ${sessionCount(backup)} sessions`);
      router.replace("/");
    } catch (err) {
      console.warn("[tally.backup] import failed:", err);
      setStatus("Import failed. Your current data is unchanged.");
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const backup = await pickBackupFile();
      if (backup == null) return;
      Alert.alert(
        "Replace all data?",
        `This erases your current splits, workouts and streak and replaces them with the backup from ${formatWhen(backup.metadata.exportedAt)} (${sessionCount(backup)} sessions). This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace everything",
            style: "destructive",
            onPress: () => {
              runImport(backup);
            },
          },
        ],
      );
    } catch (err) {
      console.warn("[tally.backup] could not read backup:", err);
      setStatus("That file is not a readable Tally backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard title="Backup">
      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">
          Save a copy of your exercises, splits, workouts and streak, or restore
          one from a file. Restoring replaces everything on this device.
        </Text>
        <View className="gap-2">
          <ActionButton
            icon={Download}
            label="Export backup"
            variant="secondary"
            disabled={busy}
            onPress={onExport}
          />
          <ActionButton
            icon={Upload}
            label="Restore backup"
            variant="danger"
            disabled={busy}
            onPress={onImport}
          />
        </View>
        {status != null && (
          <Text className="text-xs text-muted-foreground">{status}</Text>
        )}
      </View>
    </SectionCard>
  );
};
