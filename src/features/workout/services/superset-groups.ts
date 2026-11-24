import type { TodayExercise } from "@/db/today";

export interface ExerciseGroup {
  key: string;
  /** "Superset 1", "Finisher", or null for a standalone exercise. */
  label: string | null;
  exercises: TodayExercise[];
}

/**
 * Consecutive exercises carrying the same label are one superset. Order comes
 * from the split day, so two different supersets never merge just because they
 * share a name.
 */
export const groupBySuperset = (
  exercises: TodayExercise[],
): ExerciseGroup[] => {
  const groups: ExerciseGroup[] = [];
  for (const exercise of exercises) {
    const current = groups[groups.length - 1];
    if (
      exercise.supersetGroup != null &&
      current != null &&
      current.label === exercise.supersetGroup
    ) {
      current.exercises.push(exercise);
      continue;
    }
    groups.push({
      key: exercise.id,
      label: exercise.supersetGroup,
      exercises: [exercise],
    });
  }
  return groups;
};
