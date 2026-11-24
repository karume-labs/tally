import { useMemo } from "react";
import { useStreakStore } from "@/stores/use-streak-store";

export const useStreak = () => {
  const row = useStreakStore((s) => s.row);
  const milestones = useStreakStore((s) => s.milestones);

  return useMemo(
    () => ({
      streak: row?.currentStreak ?? 0,
      longest: row?.longestStreak ?? 0,
      xp: row?.xp ?? 0,
      level: row?.level ?? 1,
      freezesAvailable: row?.freezesAvailable ?? 0,
      milestones,
    }),
    [row, milestones],
  );
};
