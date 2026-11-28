import { Snowflake } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { ConfirmSheet } from "@/components/shared/ConfirmSheet";
import { Text } from "@/components/ui/text";
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
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dayKey = row == null ? null : missedDayAfter(row.lastLogDayKey);

  if (dayKey == null || (row?.freezesAvailable ?? 0) === 0) return null;

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      await spendFreeze();
      setConfirming(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="mt-4 gap-2">
      <ActionButton
        icon={Snowflake}
        label={busy ? "Applying…" : `Cover ${formatDay(dayKey)}`}
        variant="secondary"
        disabled={busy}
        onPress={() => setConfirming(true)}
      />
      {error != null && (
        <Text className="text-sm font-semibold text-destructive">{error}</Text>
      )}
      <ConfirmSheet
        visible={confirming}
        title="Use a freeze?"
        message={`This covers ${formatDay(dayKey)} and keeps your streak alive. You have ${row?.freezesAvailable ?? 0} left.`}
        confirmLabel="Use freeze"
        busy={busy}
        onConfirm={apply}
        onClose={() => setConfirming(false)}
      />
    </View>
  );
};
