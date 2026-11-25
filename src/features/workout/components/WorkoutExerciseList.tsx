import type { SetInputs } from "@/features/workout/hooks/use-set-inputs";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";

interface WorkoutExerciseListProps {
  exercises: WorkoutExercise[];
  activeExerciseId: string | null;
  inputs: SetInputs;
  onToggleActive: (exerciseId: string) => void;
}

/**
 * The plan's exercise cards. Only the open card sees the set inputs, so the
 * fields of a closed exercise never hold a stale number.
 */
export const WorkoutExerciseList = ({
  exercises,
  activeExerciseId,
  inputs,
  onToggleActive,
}: WorkoutExerciseListProps) => (
  <>
    {exercises.map((exercise) => {
      const isActive = exercise.exerciseId === activeExerciseId;
      return (
        <WorkoutExerciseCard
          key={exercise.exerciseId}
          exercise={exercise}
          isActive={isActive}
          weight={isActive ? inputs.weight : ""}
          reps={isActive ? inputs.reps : ""}
          rpe={isActive ? inputs.rpe : ""}
          onWeightChange={inputs.setWeight}
          onRepsChange={inputs.setReps}
          onRpeChange={inputs.setRpe}
          onLogSet={inputs.logSet}
          onToggleActive={() => onToggleActive(exercise.exerciseId)}
        />
      );
    })}
  </>
);
