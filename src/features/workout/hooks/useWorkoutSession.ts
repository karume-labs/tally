import { eq } from "drizzle-orm";
import { useCallback, useRef } from "react";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { WorkoutExercise } from "@/stores/useWorkoutStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";

function generateId(): string {
  return crypto.randomUUID();
}

export function useWorkoutSession() {
  const store = useWorkoutStore();
  const db = useRef<ReturnType<typeof getDb> | null>(null);

  const ensureDb = useCallback(() => {
    if (!db.current) {
      db.current = getDb();
    }
    return db.current;
  }, []);

  const startSession = useCallback(
    (splitDayId: string | null, splitDayName: string | null) => {
      const sessionId = generateId();
      const startedAt = Date.now();
      store.startSession(sessionId, splitDayId, splitDayName, startedAt);

      const db = ensureDb();
      // Create the session row (endedAt/totalVolume/prCount left null until finish).
      db.insert(schema.sessions)
        .values({
          id: sessionId,
          splitDayId,
          splitDayName,
          startedAt: new Date(startedAt),
        })
        .run();
    },
    [store, ensureDb],
  );

  const finishSession = useCallback(() => {
    const result = store.finishSession();
    const db = ensureDb();
    if (store.sessionId) {
      db.update(schema.sessions)
        .set({
          endedAt: new Date(),
          durationSeconds: result.durationSeconds,
          totalVolume: result.totalVolume,
          prCount: result.prCount,
        })
        .where(eq(schema.sessions.id, store.sessionId))
        .run();
    }

    // Insert set logs.
    for (const ex of store.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || set.completedAt == null) continue;
        const id = generateId();
        db.insert(schema.setLogs)
          .values({
            id,
            sessionId: store.sessionId ?? "",
            exerciseId: ex.exerciseId,
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

    store.reset();
    return result;
  }, [store, ensureDb]);

  const addExercise = useCallback(
    (exercise: WorkoutExercise) => {
      store.addExercise(exercise);
    },
    [store],
  );

  return {
    ...store,
    startSession,
    finishSession,
    addExercise,
  };
}
