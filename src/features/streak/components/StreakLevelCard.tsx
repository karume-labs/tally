import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { Text } from "@/components/ui/text";
import { useStreakStore } from "@/stores/use-streak-store";

/** Streak, level and the XP progress to the next level. */
export const StreakLevelCard = () => {
  const streak = useStreakStore((s) => s.row);

  return (
    <SectionCard>
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Current streak
          </Text>
          <StreakFlame streak={streak?.currentStreak ?? 0} size="md" />
          <Text className="text-xs font-semibold text-muted-foreground">
            {streak?.currentStreak === 1 ? "day" : "days"} strong
          </Text>
        </View>
        <View className="items-center gap-0.5 rounded-2xl border border-border bg-secondary px-4 py-3">
          <Text className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Level
          </Text>
          <Text className="text-3xl font-black tabular-nums">
            {streak?.level ?? 1}
          </Text>
          <Text className="text-[10px] font-semibold text-muted-foreground">
            {streak?.xp ?? 0} XP
          </Text>
        </View>
      </View>
      <View className="mt-4 h-3 overflow-hidden rounded-full border border-border bg-secondary">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${((streak?.xp ?? 0) % 500) / 5}%` }}
        />
      </View>
    </SectionCard>
  );
};
