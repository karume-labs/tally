import { eq } from "drizzle-orm";
import { useCallback, useMemo } from "react";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { createId } from "@/lib/utils";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { useWorkoutStore } from "@/stores/use-workout-store";

/**
 * Session actions. These read/write through `getState()` and are memoised so
 * effects can depend on them: returning the whole store object here recreated
 * the actions on every render and made rest-timer effects restart endlessly.
 */
export const useWorkoutSession = () => {
  const startSession = useCallback(
    (splitDayId: string | null, splitDayName: string | null) => {
      const sessionId = createId();
      const startedAt = Date.now();
      useWorkoutStore
        .getState()
        .startSession(sessionId, splitDayId, splitDayName, startedAt);

      getDb()
        .insert(schema.sessions)
        .values({
          id: sessionId,
          splitDayId,
          splitDayName,
          startedAt: new Date(startedAt),
        })
        .run();
    },
    [],
  );

  const addExercise = useCallback((exercise: WorkoutExercise) => {
    useWorkoutStore.getState().addExercise(exercise);
  }, []);

  const finishSession = useCallback(() => {
    const state = useWorkoutStore.getState();
    const sessionId = state.sessionId;
    const result = state.finishSession();

    if (sessionId != null) {
      const db = getDb();
      db.update(schema.sessions)
        .set({
          endedAt: new Date(),
          durationSeconds: result.durationSeconds,
          totalVolume: result.totalVolume,
          prCount: result.prCount,
        })
        .where(eq(schema.sessions.id, sessionId))
        .run();

      for (const exercise of state.exercises) {
        for (const set of exercise.sets) {
          if (!set.completed || set.completedAt == null) continue;
          db.insert(schema.setLogs)
            .values({
              id: createId(),
              sessionId,
              exerciseId: exercise.exerciseId,
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              isPR: set.isPR,
              completedAt: new Date(set.completedAt),
            })
            .run();
        }
      }
    }

    state.reset();
    return result;
  }, []);

  const cancelSession = useCallback(() => {
    const state = useWorkoutStore.getState();
    if (state.sessionId != null) {
      getDb()
        .delete(schema.sessions)
        .where(eq(schema.sessions.id, state.sessionId))
        .run();
    }
    state.reset();
  }, []);

  return useMemo(
    () => ({ startSession, addExercise, finishSession, cancelSession }),
    [startSession, addExercise, finishSession, cancelSession],
  );
};
