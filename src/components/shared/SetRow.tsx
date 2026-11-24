import { Check, Flag } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { formatVolume } from "@/lib/utils";

interface SetRowProps {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  isPR: boolean;
  isActive: boolean;
  onComplete?: () => void;
}

export const SetRow = ({
  setNumber,
  weight,
  reps,
  rpe,
  completed,
  isPR,
  isActive,
}: SetRowProps) => {
  const volume = weight != null && reps != null ? weight * reps : null;

  return (
    <View
      style={[
        styles.row,
        isActive && styles.rowActive,
        completed && styles.rowDone,
      ]}
    >
      <Text style={styles.num}>Set {setNumber}</Text>

      <View style={styles.values}>
        <Text style={styles.val}>{weight != null ? `${weight}kg` : "—"}</Text>
        <Text style={styles.times}>×</Text>
        <Text style={styles.val}>{reps != null ? `${reps}` : "—"}</Text>
        {rpe != null && (
          <>
            <Text style={styles.at}>@</Text>
            <Text style={[styles.val, styles.rpe]}>{rpe}</Text>
          </>
        )}
      </View>

      <View style={styles.right}>
        {completed && volume != null && (
          <View style={styles.done}>
            <Check size={14} color="#4ade80" />
            <Text style={styles.doneText}>{formatVolume(volume)}</Text>
          </View>
        )}
        {isPR && (
          <View style={styles.pr}>
            <Flag size={11} color="#fbbf24" />
            <Text style={styles.prText}>PR</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a40",
  },
  rowActive: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
  },
  rowDone: {
    opacity: 0.6,
  },
  num: {
    fontSize: 13,
    color: "#9ca3af",
    width: 56,
  },
  values: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  val: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  rpe: {
    color: "#9ca3af",
    fontSize: 12,
  },
  times: {
    fontSize: 14,
    color: "#9ca3af",
  },
  at: {
    fontSize: 14,
    color: "#9ca3af",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  done: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doneText: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
  },
  pr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  prText: {
    fontSize: 11,
    color: "#fbbf24",
    fontWeight: "800",
  },
});
