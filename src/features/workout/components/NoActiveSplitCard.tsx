import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";

interface NoActiveSplitCardProps {
  onBrowseSplits: () => void;
}

export const NoActiveSplitCard = ({
  onBrowseSplits,
}: NoActiveSplitCardProps) => (
  <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
    <Text className="text-base font-semibold">No active split</Text>
    <Text className="text-center text-sm text-muted-foreground">
      Choose a split first so Tally knows what to put in your workout.
    </Text>
    <ActionButton label="Browse splits" onPress={onBrowseSplits} />
  </View>
);
