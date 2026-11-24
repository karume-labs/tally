import { StyleSheet, Text, TextInput, View } from "react-native";

interface SplitDayEditorProps {
  name: string;
  isRestDay: boolean;
  onNameChange: (v: string) => void;
  onRestToggle: () => void;
}

export const SplitDayEditor = ({
  name,
  isRestDay,
  onNameChange,
  onRestToggle,
}: SplitDayEditorProps) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>Day name</Text>
    <TextInput
      style={styles.input}
      value={name}
      onChangeText={onNameChange}
      placeholder="e.g. Push A"
      placeholderTextColor="#9ca3af"
    />
    <View style={styles.restRow}>
      <Text style={styles.restLabel}>Rest day</Text>
      <Text
        style={[styles.toggle, isRestDay && styles.toggleActive]}
        onPress={onRestToggle}
      >
        {isRestDay ? "On" : "Off"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
  },
  input: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: "#e5e5e5",
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  restRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  restLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  toggle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9ca3af",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#2a2a40",
  },
  toggleActive: {
    color: "#e5e5e5",
    backgroundColor: "#4ade80",
  },
});
