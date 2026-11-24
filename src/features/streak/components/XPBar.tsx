import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { XP_PER_LEVEL } from "@/lib/constants";

interface XPBarProps {
  xp: number;
  level: number;
}

export const XPBar = ({ xp, level }: XPBarProps) => {
  const within = xp % XP_PER_LEVEL;
  const pct = Math.min(100, (within / XP_PER_LEVEL) * 100);
  const remaining = XP_PER_LEVEL - within;

  return (
    <View className="gap-2.5">
      <View className="h-3 overflow-hidden rounded-full border border-border bg-secondary">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-black tracking-wide text-primary">
          {xp} XP
        </Text>
        <Text className="text-xs font-semibold text-muted-foreground">
          Level {level} · {remaining} XP to next
        </Text>
      </View>
    </View>
  );
};
