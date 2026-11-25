import type { WorkoutExercise } from "@/shared/types/workout-types";

/** Exercises without a programmed set count still count after their first set. */
export const targetSets = (exercise: WorkoutExercise): number =>
  exercise.targetSets != null && exercise.targetSets > 0
    ? exercise.targetSets
    : 1;

export const completedSets = (exercise: WorkoutExercise): number =>
  exercise.sets.filter((set) => set.completed).length;

export const isExerciseComplete = (exercise: WorkoutExercise): boolean =>
  completedSets(exercise) >= targetSets(exercise);

/** Programmed sets for the whole session; untargeted exercises count as one. */
export const sessionSetTotal = (exercises: WorkoutExercise[]): number =>
  exercises.reduce((total, exercise) => total + targetSets(exercise), 0);

/**
 * Where hands-free should point next. The current exercise keeps focus until its
 * programmed sets are done; after that the next unfinished exercise takes over.
 * Returns null when the whole session is complete.
 */
export const pickNextExercise = (
  exercises: WorkoutExercise[],
  activeExerciseId: string | null,
): WorkoutExercise | null => {
  const active = exercises.find(
    (exercise) => exercise.exerciseId === activeExerciseId,
  );
  if (active != null && !isExerciseComplete(active)) return active;
  return (
    exercises.find(
      (exercise) =>
        exercise.exerciseId !== activeExerciseId &&
        !isExerciseComplete(exercise),
    ) ?? null
  );
};

/** True when every exercise in the session has met its target. */
export const isSessionComplete = (exercises: WorkoutExercise[]): boolean =>
  exercises.length > 0 && exercises.every(isExerciseComplete);
