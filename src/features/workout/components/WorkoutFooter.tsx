import { Flag } from "lucide-react-native";
import { ActionButton } from "@/components/shared/ActionButton";

interface WorkoutFooterProps {
  hasSession: boolean;
  hasExercises: boolean;
  onFinish: () => void;
}

export const WorkoutFooter = ({
  hasSession,
  hasExercises,
  onFinish,
}: WorkoutFooterProps) => {
  if (!hasSession || !hasExercises) return null;

  return (
    <ActionButton
      size="lg"
      icon={Flag}
      label="Finish workout"
      onPress={onFinish}
    />
  );
};
