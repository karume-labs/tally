import { Plus, Trash2 } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import styles from "@/features/home/home-styles";
import { useWorkoutStore } from "@/stores/use-workout-store";

interface HomeQuickActionsProps {
  onAddExercise: () => void;
}

export const HomeQuickActions = ({ onAddExercise }: HomeQuickActionsProps) => {
  const reset = useWorkoutStore((s) => s.reset);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsRow}>
        <Button
          variant="secondary"
          size="lg"
          onPress={onAddExercise}
          style={styles.actionButton}
        >
          <Plus size={18} />
          <Text style={styles.actionText}>Add Exercise</Text>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onPress={reset}
          style={styles.actionButton}
        >
          <Trash2 size={18} />
          <Text style={styles.actionText}>Clear</Text>
        </Button>
      </View>
    </View>
  );
};
