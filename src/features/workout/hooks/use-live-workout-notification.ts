import { useCallback, useEffect } from "react";
import {
  pickNextExercise,
  sessionSetTotal,
} from "@/features/workout/services/next-exercise";
import { startLiveWorkout, updateLiveWorkout } from "@/services/live-workout";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { useWorkoutStore } from "@/stores/use-workout-store";

interface UseLiveWorkoutNotificationArgs {
  sessionId: string | null;
  exercises: WorkoutExercise[];
  completedSets: number;
  restTimerEndsAt: number | null;
  activeExercise: WorkoutExercise | null | undefined;
  activeExerciseId: string | null;
}

/**
 * Keeps the ongoing notification in step with the session: `announce` posts it
 * as soon as a session starts, and the effect below pushes every later change,
 * including a remount, where it replaces the same notification rather than
 * stacking a second one.
 */
export const useLiveWorkoutNotification = ({
  sessionId,
  exercises,
  completedSets,
  restTimerEndsAt,
  activeExercise,
  activeExerciseId,
}: UseLiveWorkoutNotificationArgs): ((dayName: string) => void) => {
  const announce = useCallback((dayName: string) => {
    const running = useWorkoutStore.getState();
    if (running.startedAt == null) return;
    const first = pickNextExercise(running.exercises, null);
    startLiveWorkout({
      startedAt: running.startedAt,
      dayName,
      totalSets: sessionSetTotal(running.exercises),
      // The effect below fills the focused exercise in as soon as one is open,
      // including on this render.
      exerciseName: null,
      nextName: first == null ? null : first.name,
    });
  }, []);

  // The title follows the open exercise, and while a rest is running its
  // deadline takes over the chronometer as a countdown.
  useEffect(() => {
    if (sessionId == null) return;
    const next = pickNextExercise(exercises, activeExerciseId);
    updateLiveWorkout({
      completedSets,
      totalSets: sessionSetTotal(exercises),
      exerciseName: activeExercise == null ? null : activeExercise.name,
      nextName: next == null ? null : next.name,
      restEndsAt: restTimerEndsAt,
    });
  }, [
    sessionId,
    exercises,
    completedSets,
    restTimerEndsAt,
    activeExercise,
    activeExerciseId,
  ]);

  return announce;
};
