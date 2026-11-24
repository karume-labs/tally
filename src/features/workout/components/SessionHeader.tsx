import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { formatDuration, formatVolume } from "@/lib/utils";

interface SessionHeaderProps {
  durationSeconds: number | null;
  totalVolume: number | null;
  completedSets: number;
  isRestDay: boolean;
  onCancel?: () => void;
}

export const SessionHeader = ({
  durationSeconds,
  totalVolume,
  completedSets,
  isRestDay,
  onCancel,
}: SessionHeaderProps) => (
  <View style={styles.card}>
    <View style={styles.stats}>
      <View style={styles.stat}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{formatDuration(durationSeconds)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Volume</Text>
        <Text style={styles.value}>{formatVolume(totalVolume)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Sets</Text>
        <Text style={styles.value}>{completedSets}</Text>
      </View>
    </View>
    {isRestDay && (
      <View style={styles.restBadge}>
        <Text style={styles.restText}>Rest day — no session</Text>
      </View>
    )}
    {onCancel && (
      <Text style={styles.cancel} onPress={onCancel}>
        Cancel session
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  stats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e5e5",
    marginTop: 2,
  },
  restBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2a4a3a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4ade80",
    marginBottom: 8,
  },
  restText: {
    color: "#4ade80",
    fontSize: 13,
    fontWeight: "600",
  },
  cancel: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    alignSelf: "center",
  },
});
