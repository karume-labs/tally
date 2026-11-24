import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { SetLogger } from "./SetLogger";
import { WorkoutSetRow } from "./WorkoutSetRow";

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  isActive: boolean;
  weight: string;
  reps: string;
  rpe: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onLogSet: () => void;
  onToggleActive: () => void;
}

export const WorkoutExerciseCard = ({
  exercise,
  isActive,
  weight,
  reps,
  rpe,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onLogSet,
  onToggleActive,
}: WorkoutExerciseCardProps) => {
  const prCount = exercise.sets.filter((set) => set.isPR).length;

  return (
    <View
      className={cn(
        "rounded-3xl border bg-card p-5",
        isActive ? "border-primary" : "border-border",
      )}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold">{exercise.name}</Text>
          <Text className="text-xs text-muted-foreground">
            {exercise.targetSets != null && exercise.targetReps != null
              ? `${exercise.targetSets} × ${exercise.targetReps}`
              : "No target"}
            {exercise.restSeconds > 0 ? ` · ${exercise.restSeconds}s rest` : ""}
          </Text>
          {exercise.notes.length > 0 && (
            <Text className="text-[11px] leading-4 text-muted-foreground">
              {exercise.notes}
            </Text>
          )}
        </View>
        {prCount > 0 && (
          <Text className="rounded bg-primary/15 px-2 py-1 text-[11px] font-bold text-primary">
            {prCount} PR{prCount === 1 ? "" : "s"}
          </Text>
        )}
      </View>

      <View className="mt-2">
        {exercise.sets.length === 0 ? (
          <Text className="py-2 text-xs text-muted-foreground">
            No sets logged yet.
          </Text>
        ) : (
          exercise.sets.map((set) => (
            <WorkoutSetRow key={set.setNumber} set={set} />
          ))
        )}
      </View>

      {isActive && (
        <SetLogger
          weight={weight}
          reps={reps}
          rpe={rpe}
          onWeightChange={onWeightChange}
          onRepsChange={onRepsChange}
          onRpeChange={onRpeChange}
          onLog={onLogSet}
        />
      )}

      <ActionButton
        variant={isActive ? "secondary" : "outline"}
        size="sm"
        className="mt-4 self-start"
        label={isActive ? "Close" : "Log sets"}
        onPress={onToggleActive}
      />
    </View>
  );
};
