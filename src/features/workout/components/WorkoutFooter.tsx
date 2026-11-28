import { Flag } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";

interface WorkoutFooterProps {
  hasSession: boolean;
  hasExercises: boolean;
  canFinish: boolean;
  onFinish: () => void;
}

export const WorkoutFooter = ({
  hasSession,
  hasExercises,
  canFinish,
  onFinish,
}: WorkoutFooterProps) => {
  const insets = useSafeAreaInsets();
  if (!hasSession || !hasExercises) return null;

  return (
    // The keyboard can zero out the bottom inset, so keep a floor that still
    // clears the gesture bar.
    <View
      className="border-t border-border bg-background px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 20) + 20 }}
    >
      <ActionButton
        size="lg"
        icon={Flag}
        label="Finish workout"
        // A session without a logged set is not training: finishing it would
        // award XP and extend the streak for nothing.
        disabled={!canFinish}
        onPress={onFinish}
      />
    </View>
  );
};
