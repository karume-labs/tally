import { Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatRestRemaining } from "@/lib/utils";

interface RestTimerBarProps {
  endsAt: number | null;
  /** The full rest length, for the progress bar. */
  totalSeconds?: number;
  nextName?: string | null;
  onSkip: () => void;
}

export const RestTimerBar = ({
  endsAt,
  totalSeconds,
  nextName,
  onSkip,
}: RestTimerBarProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (endsAt == null) return;
    const timer = setInterval(() => setTick((tick) => tick + 1), 250);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (endsAt == null) return null;
  const remainingMs = Math.max(0, endsAt - Date.now());
  const finished = remainingMs <= 0;
  const total = (totalSeconds ?? 0) * 1000;
  const progress = total > 0 ? Math.min(1, 1 - remainingMs / total) : 0;

  return (
    <View className="gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
      <View className="flex-row items-center gap-3">
        <Icon as={Clock} className="text-primary" />
        <View className="flex-1">
          <Text className="text-base font-bold tabular-nums text-primary">
            {finished ? "Rest complete" : `Rest ${formatRestRemaining(endsAt)}`}
          </Text>
          {!finished && nextName != null && (
            <Text className="text-[11px] text-muted-foreground">
              Next: {nextName}
            </Text>
          )}
        </View>
        {!finished && (
          <ActionButton
            variant="ghost"
            size="sm"
            label="Skip"
            onPress={onSkip}
          />
        )}
      </View>
      {!finished && (
        <View className="h-1.5 overflow-hidden rounded-full bg-primary/20">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
      )}
    </View>
  );
};
