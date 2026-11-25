import { useCallback, useEffect, useRef } from "react";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { completedSets, pickNextExercise } from "../services/next-exercise";

/** A zero-rest completion gets a beat so the logged set stays visible. */
const ZERO_REST_BEAT_MS = 1500;
/** Timers can fire a hair early, so wait past the deadline before acting. */
const REST_GRACE_MS = 100;

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

  // Read through a ref so the rest timeout is armed once per rest. Depending on
  // `advance` directly re-armed it on every logged set and always against the
  // exercises captured when it was armed; the ref advances from current state.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    if (restTimerEndsAt == null) return;
    const timer = setTimeout(
      () => {
        onRestEnd();
        if (enabled) advanceRef.current();
      },
      Math.max(0, restTimerEndsAt - Date.now()) + REST_GRACE_MS,
    );
    return () => clearTimeout(timer);
  }, [restTimerEndsAt, enabled, onRestEnd]);

  // A zero-rest exercise never arms a rest, so its completion is the only cue
  // to move on. The completed-count check matters: without it, re-opening an
  // exercise that was already finished hopped away from it a beat later, and
  // any unrelated store write restarted the beat.
  const completion = useRef<{ exerciseId: string | null; completed: number }>({
    exerciseId: null,
    completed: 0,
  });

  useEffect(() => {
    const previous = completion.current;
    const current = exercises.find(
      (exercise) => exercise.exerciseId === activeExerciseId,
    );
    const completed = current == null ? 0 : completedSets(current);
    completion.current = { exerciseId: activeExerciseId, completed };

    if (!enabled || restTimerEndsAt != null) return;
    const justFinished =
      current != null &&
      previous.exerciseId === activeExerciseId &&
      completed > previous.completed;
    if (!justFinished) return;
    const next = pickNextExercise(exercises, activeExerciseId);
    if (next == null || next.exerciseId === activeExerciseId) return;
    const timer = setTimeout(advance, ZERO_REST_BEAT_MS);
    return () => clearTimeout(timer);
  }, [enabled, exercises, activeExerciseId, restTimerEndsAt, advance]);

  // Focus the first unfinished exercise once per session. Re-running this every
  // time focus is cleared made the active card impossible to close: collapsing
  // it instantly re-selected it (or jumped to the next unfinished exercise).
  const autoSelected = useRef(false);

  useEffect(() => {
    // A new session clears the plan before loading the next one.
    if (exercises.length === 0) {
      autoSelected.current = false;
      return;
    }
    if (!enabled) return;
    if (activeExerciseId != null) {
      autoSelected.current = true;
      return;
    }
    if (autoSelected.current) return;
    const first = pickNextExercise(exercises, null);
    if (first == null) return;
    autoSelected.current = true;
    onAdvance(first.exerciseId);
  }, [enabled, exercises, activeExerciseId, onAdvance]);
};
