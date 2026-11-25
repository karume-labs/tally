import { useCallback, useEffect } from "react";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { pickNextExercise } from "../services/next-exercise";

interface UseAutoAdvanceArgs {
  enabled: boolean;
  exercises: WorkoutExercise[];
  activeExerciseId: string | null;
  restTimerEndsAt: number | null;
  onAdvance: (exerciseId: string) => void;
  onRestEnd: () => void;
}

/**
 * Hands-free flow. On rest expiry the timer is cleared and focus moves to
 * whichever exercise still owes sets (the current one if it is unfinished,
 * otherwise the next unfinished one). Rest lengths of 0 get a short beat so the
 * logged set is visible before the next exercise opens, and a brand-new session
 * opens on its first exercise without a tap.
 */
export const useAutoAdvance = ({
  enabled,
  exercises,
  activeExerciseId,
  restTimerEndsAt,
  onAdvance,
  onRestEnd,
}: UseAutoAdvanceArgs) => {
  const advance = useCallback(() => {
    const next = pickNextExercise(exercises, activeExerciseId);
    if (next != null) onAdvance(next.exerciseId);
  }, [exercises, activeExerciseId, onAdvance]);

  useEffect(() => {
    if (restTimerEndsAt == null) return;
    const remaining = restTimerEndsAt - Date.now();
    const timer = setTimeout(() => {
      onRestEnd();
      if (enabled) advance();
    }, Math.max(0, remaining) + 100);
    return () => clearTimeout(timer);
  }, [restTimerEndsAt, enabled, advance, onRestEnd]);

  useEffect(() => {
    if (!enabled) return;
    // A zero-rest exercise never starts a timer, so completion is the only cue
    // that it is time to move on.
    if (restTimerEndsAt != null) return;
    const current = exercises.find(
      (exercise) => exercise.exerciseId === activeExerciseId,
    );
    if (current == null) return;
    const done = pickNextExercise(exercises, activeExerciseId);
    if (done == null || done.exerciseId === activeExerciseId) return;
    const timer = setTimeout(advance, 1500);
    return () => clearTimeout(timer);
  }, [enabled, exercises, activeExerciseId, restTimerEndsAt, advance]);

  useEffect(() => {
    if (!enabled || activeExerciseId != null || exercises.length === 0) return;
    const first = pickNextExercise(exercises, null);
    if (first != null) onAdvance(first.exerciseId);
  }, [enabled, activeExerciseId, exercises, onAdvance]);
};
