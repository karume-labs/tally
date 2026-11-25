import { View } from "react-native";
import { Text } from "@/components/ui/text";
import styles from "@/features/home/home-styles";
import type { DayDot } from "@/services/streak";

const LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const WORKOUT = "#4ade80";
const MISSED = "#1a1a2e";

interface HomeWeeklyDotsProps {
  dots: DayDot[];
}

export const HomeWeeklyDots = ({ dots }: HomeWeeklyDotsProps) => {
  const dotsWithLabel = dots.map((d, i) => {
    const color = d.status === "workout" ? WORKOUT : MISSED;
    return { label: LABELS[i] ?? "", color, dayKey: d.dayKey };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Last 7 days</Text>
      <View style={styles.weekRow}>
        {dotsWithLabel.map((d) => (
          <View
            key={d.dayKey}
            style={[styles.dayCell, { backgroundColor: d.color }]}
          >
            <Text style={styles.dayLetter}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
