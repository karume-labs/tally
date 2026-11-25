import { evaluateSetLog, recomputeTotals } from "@/lib/pr-evaluation";
import type {
  PrBest,
  WorkoutExercise,
  WorkoutSet,
} from "@/shared/types/workout-types";

export interface WorkoutSnapshot {
  exercises: WorkoutExercise[];
  prBest: Record<string, PrBest>;
  restTimerEndsAt: number | null;
  totalVolume: number;
  completedSets: number;
}

export const applyLogSet = (
  snapshot: WorkoutSnapshot,
  exerciseId: string,
  setNumber: number,
  weight: number | null,
  reps: number | null,
  rpe: number | null,
  completedAt: number,
): {
  newSet: WorkoutSet;
  exercises: WorkoutExercise[];
  prBest: Record<string, PrBest>;
  restTimerEndsAt: number | null;
  totalVolume: number;
  completedSets: number;
} | null => {
  const exercise = snapshot.exercises.find((e) => e.exerciseId === exerciseId);
  if (!exercise) return null;

  const best = snapshot.prBest[exerciseId] ?? {
    bestWeight: null,
    bestReps: null,
    bestVolume: null,
  };
  const { isPR, updatedBest } = evaluateSetLog(
    weight,
    reps,
    rpe,
    completedAt,
    best,
  );

  const newSet: WorkoutSet = {
    setNumber,
    weight,
    reps,
    rpe,
    completed: !!completedAt,
    completedAt,
    isPR,
  };

  // Replace the exercise in place. Appending a copy when the log was the
  // first set duplicated the exercise in the session (and its React key).
  const sets = exercise.sets.some((s) => s.setNumber === setNumber)
    ? exercise.sets.map((s) => (s.setNumber === setNumber ? newSet : s))
    : [...exercise.sets, newSet];
  const exercises = snapshot.exercises.map((e) =>
    e.exerciseId === exerciseId ? { ...e, sets } : e,
  );

  const prBest = {
    ...snapshot.prBest,
    [exerciseId]: updatedBest,
  };

  const { totalVolume, completedSets } = recomputeTotals(exercises);

  // A zero-rest exercise must clear the previous timer; keeping it would leave
  // a countdown running that belongs to an earlier exercise.
  const restTimerEndsAt =
    completedAt != null && exercise.restSeconds > 0
      ? completedAt + exercise.restSeconds * 1000
      : null;

  return {
    newSet,
    exercises,
    prBest,
    restTimerEndsAt,
    totalVolume,
    completedSets,
  };
};

export const applyCompleteSet = (
  snapshot: WorkoutSnapshot,
  exerciseId: string,
  setNumber: number,
): {
  exercises: WorkoutExercise[];
  restTimerEndsAt: number | null;
  totalVolume: number;
  completedSets: number;
} | null => {
  const exercise = snapshot.exercises.find((e) => e.exerciseId === exerciseId);
  if (!exercise) return null;

  const now = Date.now();
  const exercises = snapshot.exercises.map((e) =>
    e.exerciseId === exerciseId
      ? {
          ...e,
          sets: e.sets.map((s) =>
            s.setNumber === setNumber
              ? {
                  ...s,
                  completed: true,
                  completedAt: now,
                  isPR: s.isPR,
                }
              : s,
          ),
        }
      : e,
  );

  const { totalVolume, completedSets } = recomputeTotals(exercises);

  const restTimerEndsAt =
    exercise.restSeconds > 0 ? now + exercise.restSeconds * 1000 : null;

  return { exercises, restTimerEndsAt, totalVolume, completedSets };
};

export const buildFinishResult = (
  snapshot: WorkoutSnapshot,
  startedAt: number | null,
): {
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  prCount: number;
  setLogs: WorkoutSet[];
} => {
  const started = startedAt ?? Date.now();
  const durationSeconds = Math.round((Date.now() - started) / 1000);
  const prCount = snapshot.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isPR).length,
    0,
  );
  const setLogs = snapshot.exercises.flatMap((ex) =>
    ex.sets.map((s) => ({ exerciseId: ex.exerciseId, ...s })),
  );

  return {
    durationSeconds,
    totalVolume: snapshot.totalVolume,
    completedSets: snapshot.completedSets,
    prCount,
    setLogs,
  };
};
