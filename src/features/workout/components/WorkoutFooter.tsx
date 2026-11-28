import { Flag } from "lucide-react-native";
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
  if (!hasSession || !hasExercises) return null;

  return (
    <ActionButton
      size="lg"
      icon={Flag}
      label="Finish workout"
      // A session without a logged set is not training: finishing it would
      // award XP and extend the streak for nothing.
      disabled={!canFinish}
      onPress={onFinish}
    />
  );
};
