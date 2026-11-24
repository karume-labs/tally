import { View } from "react-native";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { Text } from "@/components/ui/text";
import styles from "../home-styles";

interface HomeStreakCardProps {
  streak: { currentStreak: number; xp: number; level: number } | null;
}

export const HomeStreakCard = ({ streak }: HomeStreakCardProps) => (
  <View style={styles.card}>
    <View style={styles.streakRow}>
      <StreakFlame streak={streak?.currentStreak ?? 0} size="lg" />
      <View style={styles.streakMeta}>
        <Text style={styles.streakLabel}>
          {streak?.currentStreak ?? 0} day streak
        </Text>
      </View>
    </View>
    <View style={styles.xpRow}>
      <View style={styles.xpBarBg}>
        <View style={[styles.xpBar, { width: "0%" }]} />
      </View>
      <View style={styles.xpTextRow}>
        <Text style={styles.xpText}>{streak?.xp ?? 0} XP</Text>
        <Text style={styles.xpTextMuted}>/ 500 to next level</Text>
      </View>
    </View>
  </View>
);
