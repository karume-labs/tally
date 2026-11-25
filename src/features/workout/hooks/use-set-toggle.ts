import { useCallback } from "react";
import { syncSetLog } from "@/features/workout/services/set-log-writes";
import { useWorkoutStore } from "@/stores/use-workout-store";

/**
 * Ticking a set back off removes its row, so an abandoned session keeps only
 * the work that still counted. The row is read after the store update so the
 * write follows the state that will be finished.
 */
export const useSetToggle = () =>
  useCallback((exerciseId: string, setNumber: number) => {
    const sessionId = useWorkoutStore.getState().sessionId;
    useWorkoutStore.getState().toggleSetCompleted(exerciseId, setNumber);
    if (sessionId == null) return;

    const exercise = useWorkoutStore
      .getState()
      .exercises.find((row) => row.exerciseId === exerciseId);
    const set = exercise?.sets.find((row) => row.setNumber === setNumber);
    if (set == null) return;
    syncSetLog(sessionId, exerciseId, set);
  }, []);
