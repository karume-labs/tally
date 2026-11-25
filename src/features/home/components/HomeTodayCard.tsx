import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import styles from "@/features/home/home-styles";
import type { WorkoutExercise } from "@/shared/types/workout-types";

const _WORKOUT = "#4ade80";
const _MUTED = "#9ca3af";
const _FORE = "#e5e5e5";

interface HomeTodayCardProps {
  exercises: WorkoutExercise[];
  isRestDay: boolean;
  onStart: () => void;
}

export const HomeTodayCard = ({
  exercises,
  isRestDay,
  onStart,
}: HomeTodayCardProps) => (
  <View style={styles.card}>
    <View style={styles.todayHeader}>
      <View style={styles.todayTitleRow}>
        <Text style={styles.todayTitle}>Today's Workout</Text>
        {isRestDay && (
          <View style={styles.restBadge}>
            <Text style={styles.restText}>Rest day</Text>
          </View>
        )}
      </View>
    </View>
    {exercises.length > 0 && (
      <>
        <Text style={styles.todayExerciseLabel}>
          {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
        </Text>
        <View style={styles.exercisePreview}>
          {exercises.slice(0, 3).map((ex) => (
            <View key={ex.exerciseId} style={styles.exerciseChip}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
            </View>
          ))}
          {exercises.length > 3 && (
            <Text style={styles.moreText}>+{exercises.length - 3} more</Text>
          )}
        </View>
      </>
    )}
    <Button
      size="lg"
      variant="default"
      onPress={onStart}
      style={styles.startButton}
    >
      <Text style={styles.startButtonText}>Start Workout</Text>
    </Button>
  </View>
);
