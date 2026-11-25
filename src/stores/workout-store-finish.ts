import type { WorkoutSet } from "@/shared/types/workout-types";
import type { WorkoutSnapshot } from "./workout-store-draft";

/** Everything the finished-session write needs, computed from the snapshot. */
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
