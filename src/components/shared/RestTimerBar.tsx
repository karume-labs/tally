import { Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatRestRemaining } from "@/lib/utils";

interface RestTimerBarProps {
  endsAt: number | null;
  onSkip: () => void;
}

export const RestTimerBar = ({ endsAt, onSkip }: RestTimerBarProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (endsAt == null) return;
    const timer = setInterval(() => setTick((tick) => tick + 1), 250);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (endsAt == null) return null;
  const finished = Date.now() >= endsAt;

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
      <Icon as={Clock} className="text-primary" />
      <Text className="flex-1 text-base font-bold tabular-nums text-primary">
        {finished ? "Rest complete" : `Rest ${formatRestRemaining(endsAt)}`}
      </Text>
      {!finished && (
        <ActionButton variant="ghost" size="sm" label="Skip" onPress={onSkip} />
      )}
    </View>
  );
};
