import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { formatDuration } from "@/lib/utils";

interface WorkoutHeaderActionsProps {
  elapsed: number;
  showCancel: boolean;
  onCancel: () => void;
}

/** The running clock and the cancel affordance, rendered into the nav header. */
export const WorkoutHeaderActions = ({
  elapsed,
  showCancel,
  onCancel,
}: WorkoutHeaderActionsProps) => (
  <View className="flex-row items-center gap-3">
    <Text className="text-sm font-semibold text-muted-foreground">
      {formatDuration(elapsed)}
    </Text>
    {showCancel && (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel session"
        onPress={onCancel}
        className="rounded-lg border border-border px-2.5 py-1 active:opacity-70"
      >
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Cancel
        </Text>
      </Pressable>
    )}
  </View>
);
