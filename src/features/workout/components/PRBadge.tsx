import { Flag } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";

interface PRBadgeProps {
  count?: number;
  size?: "sm" | "md";
}

export const PRBadge = ({ count = 1, size = "md" }: PRBadgeProps) => (
  <View style={[styles.badge, styles[size]]}>
    <Flag size={size === "sm" ? 10 : 12} color="#fbbf24" />
    <Text style={[styles.text, { fontSize: size === "sm" ? 11 : 12 }]}>
      {count > 1 ? `${count} PRs` : "PR"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(251,191,36,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  md: {},
  text: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fbbf24",
  },
});
