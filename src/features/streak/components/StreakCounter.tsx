import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { DayDotRow } from "@/components/shared/DayDotRow";
import { SectionCard } from "@/components/shared/SectionCard";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { Text } from "@/components/ui/text";
import { loadRecentHistory } from "@/db/streak-history";
import { last7DayDots } from "@/services/streak";
import { useStreakStore } from "@/stores/use-streak-store";
import { FreezeToken } from "./FreezeToken";
import { XPBar } from "./XPBar";

export const StreakCounter = () => {
  const row = useStreakStore((s) => s.row);
  const [history, setHistory] = useState<
    Array<{ dayKey: string; status: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    loadRecentHistory().then((rows) => {
      if (!cancelled) setHistory(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dots = useMemo(
    () => last7DayDots(history, row?.lastLogDayKey ?? null),
    [history, row?.lastLogDayKey],
  );

  return (
    <View className="gap-4">
      <SectionCard>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Current streak
            </Text>
            <StreakFlame streak={row?.currentStreak ?? 0} size="lg" />
            <Text className="text-sm text-muted-foreground">
              {row?.currentStreak === 1 ? "day" : "days"} in a row
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Best
            </Text>
            <Text className="text-4xl font-black tabular-nums">
              {row?.longestStreak ?? 0}
            </Text>
            <Text className="text-xs text-muted-foreground">days</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Level">
        <XPBar xp={row?.xp ?? 0} level={row?.level ?? 1} />
        <View className="mt-4 flex-row justify-between">
          <Text className="text-xs font-semibold text-muted-foreground">
            {row?.totalSessions ?? 0} sessions
          </Text>
          <Text className="text-xs font-semibold text-muted-foreground">
            {Math.round(row?.totalVolume ?? 0)} kg lifted
          </Text>
        </View>
      </SectionCard>

      <SectionCard title="Last 7 days">
        <DayDotRow dots={dots} />
      </SectionCard>

      <SectionCard title="Freezes">
        <FreezeToken />
        <Text className="mt-2 text-xs text-muted-foreground">
          Earn a freeze at 7, 30 and 100 days. Freezes cover a missed day.
        </Text>
      </SectionCard>
    </View>
  );
};
