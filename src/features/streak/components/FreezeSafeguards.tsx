import { Snowflake } from "lucide-react-native";
import { useState } from "react";
import { Alert } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import {
  missedDayAfter,
  spendFreeze,
} from "@/features/streak/services/freeze-day";
import { parseDayKey } from "@/lib/day-key";
import { useStreakStore } from "@/stores/use-streak-store";

const formatDay = (dayKey: string): string =>
  parseDayKey(dayKey).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

interface FreezeSafeguardsProps {
  /** Called after a freeze is spent so the parent can reload history. */
  onChanged: () => void;
}

export const FreezeSafeguards = ({ onChanged }: FreezeSafeguardsProps) => {
  const row = useStreakStore((s) => s.row);
  const [busy, setBusy] = useState(false);
  const dayKey = row == null ? null : missedDayAfter(row.lastLogDayKey);

  if (dayKey == null || (row?.freezesAvailable ?? 0) === 0) return null;

  const apply = async () => {
    setBusy(true);
    try {
      await spendFreeze();
      onChanged();
    } catch (err) {
      Alert.alert(
        "Can't use freeze",
        err instanceof Error ? err.message : "Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    Alert.alert(
      "Use a freeze?",
      `This covers ${formatDay(dayKey)} and keeps your streak alive. You have ${row?.freezesAvailable ?? 0} left.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use freeze",
          onPress: () => {
            apply();
          },
        },
      ],
    );
  };

  return (
    <ActionButton
      className="mt-4"
      icon={Snowflake}
      label={busy ? "Applying…" : `Cover ${formatDay(dayKey)}`}
      variant="secondary"
      disabled={busy}
      onPress={confirm}
    />
  );
};
