import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";

interface StreakFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  theme?: unknown;
}

const SIZES = {
  sm: { badge: 22, flame: 14, stroke: 1.5 },
  md: { badge: 30, flame: 19, stroke: 1.75 },
  lg: { badge: 38, flame: 24, stroke: 2 },
} as const;

const STREAK_GREEN = "#4ade80";

export function StreakFlame({ streak, size = "md" }: StreakFlameProps) {
  const s = SIZES[size];
  const STREAK_GREEN = "#4ade80";

  const flamePath = useMemo(
    () =>
      `M 9 2
       C 4 8, 2 12, 2 17
       C 2 22, 6 25, 9 25
       C 11 25, 13 24, 14 22
       C 17 21, 18 18, 18 15
       C 18 11, 15 8, 11 6
       C 10 5, 9 3, 9 2 Z`,
    [],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.badge, { width: s.badge, height: s.badge }]}>
        <Text
          style={[
            styles.count,
            { fontSize: s.badge * 0.42, borderRadius: s.badge / 2 },
          ]}
        >
          {streak}
        </Text>
      </View>
      <svg
        width={SIZES.md.flame * 2}
        height={SIZES.md.flame * 2}
        viewBox="0 0 24 24"
      >
        <path
          d={flamePath}
          fill="none"
          stroke={STREAK_GREEN}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: 15,
    backgroundColor: "#1a1a2e",
    borderWidth: 2,
    borderColor: STREAK_GREEN,
    overflow: "hidden",
  },
  count: {
    textAlign: "center",
    color: STREAK_GREEN,
    fontWeight: "800",
  },
});
