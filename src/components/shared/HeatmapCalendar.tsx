import { useMemo } from "react";
import { View } from "react-native";
import { last7DayDots } from "@/services/streak";
import { useStreakStore } from "@/stores/use-streak-store";
import { DayDotRow } from "./DayDotRow";

export const HeatmapCalendar = () => {
  const streak = useStreakStore((s) => s.row);

  const dots = useMemo(
    () => last7DayDots([], streak?.lastLogDayKey ?? null),
    [streak?.lastLogDayKey],
  );

  return (
    <View>
      <DayDotRow dots={dots} />
    </View>
  );
};
