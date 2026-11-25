import * as Haptics from "expo-haptics";
import { useCallback, useEffect } from "react";
import { useAutoAdvance } from "@/features/workout/hooks/use-auto-advance";
import { pickNextExercise } from "@/features/workout/services/next-exercise";
import {
  cancelRestNotification,
  scheduleRestNotification,
} from "@/services/notifications";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { useWorkoutStore } from "@/stores/use-workout-store";

interface UseRestTimerArgs {
  exercises: WorkoutExercise[];
  activeExercise: WorkoutExercise | null | undefined;
  activeExerciseId: string | null;
  restTimerEndsAt: number | null;
  autoAdvance: boolean;
  hapticsEnabled: boolean;
  onAdvance: (exerciseId: string) => void;
}

/**
 * Owns the rest countdown between sets: the handled alert, hands-free advancing,
 * and the "Skip" the notification's action shares with the on-screen button.
 */
export const useRestTimer = ({
  exercises,
  activeExercise,
  activeExerciseId,
  restTimerEndsAt,
  autoAdvance,
  hapticsEnabled,
  onAdvance,
}: UseRestTimerArgs): { skipRest: () => void; nextName: string | null } => {
  const handleRestEnd = useCallback(() => {
    // The banner is derived from the store, so clearing the timer also clears
    // the "Rest complete" state on the next render.
    useWorkoutStore.getState().skipRest();
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {
        // Haptics are best-effort.
      },
    );
  }, [hapticsEnabled]);

  useAutoAdvance({
    enabled: autoAdvance,
    exercises,
    activeExerciseId,
    restTimerEndsAt,
    onAdvance,
    onRestEnd: handleRestEnd,
  });

  const restExerciseName =
    activeExercise == null ? "your next set" : activeExercise.name;

  // Keep the scheduled alert in step with the in-app rest timer, including
  // when the app is backgrounded or killed during a rest.
  useEffect(() => {
    if (restTimerEndsAt == null) return;
    scheduleRestNotification(restTimerEndsAt, restExerciseName);
    return () => {
      cancelRestNotification();
    };
  }, [restTimerEndsAt, restExerciseName]);

  // The next exercise's name belongs to the rest banner, so it is derived here
  // with the timer it describes.
  const nextUp = pickNextExercise(exercises, activeExerciseId);
  const nextName =
    nextUp != null && nextUp.exerciseId !== activeExerciseId
      ? nextUp.name
      : null;

  const skipRest = useCallback(() => {
    handleRestEnd();
    if (!autoAdvance) return;
    const next = pickNextExercise(exercises, activeExerciseId);
    if (next != null) onAdvance(next.exerciseId);
  }, [handleRestEnd, autoAdvance, exercises, activeExerciseId, onAdvance]);

  return { skipRest, nextName };
};
