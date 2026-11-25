import type { WorkoutExercise, WorkoutSet } from "@/shared/types/workout-types";
import type { WorkoutSnapshot } from "./workout-store-draft";

export const makeExercise = (
  exerciseId: string,
  sets: WorkoutSet[] = [],
  restSeconds = 90,
): WorkoutExercise => ({
  exerciseId,
  name: "Bench Press",
  muscleGroup: "chest",
  equipment: "barbell",
  targetSets: 4,
  targetReps: "8-10",
  restSeconds,
  notes: "",
  sets,
});

export const makeSnapshot = (
  exercises: WorkoutExercise[],
): WorkoutSnapshot => ({
  exercises,
  prBest: {},
  restTimerEndsAt: null,
  totalVolume: 0,
  completedSets: 0,
});

export const makeSet = (
  setNumber: number,
  overrides: Partial<WorkoutSet> = {},
): WorkoutSet => ({
  setNumber,
  weight: 100,
  reps: 10,
  rpe: null,
  completed: true,
  completedAt: Date.now(),
  isPR: false,
  ...overrides,
});
