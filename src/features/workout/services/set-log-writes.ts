import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { WorkoutExercise, WorkoutSet } from "@/shared/types/workout-types";

/**
 * One row per session + exercise + set number. The deterministic id is what
 * lets a rewrite (re-logging a set, finishing, boot cleanup) update the same row
 * instead of filing a second copy of that set in the history.
 */
export const setLogId = (
  sessionId: string,
  exerciseId: string,
  setNumber: number,
): string => `${sessionId}:${exerciseId}:${setNumber}`;

interface SetLogWrite {
  sessionId: string;
  exerciseId: string;
  set: WorkoutSet;
}

const report = (err: unknown) => {
  // A failed write must not break logging; the finish pass rewrites the rows.
  console.warn("[tally.setLog] write failed:", err);
};

export const saveSetLog = ({ sessionId, exerciseId, set }: SetLogWrite) => {
  if (!set.completed || set.completedAt == null) return;
  const completedAt = new Date(set.completedAt);
  try {
    getDb()
      .insert(schema.setLogs)
      .values({
        id: setLogId(sessionId, exerciseId, set.setNumber),
        sessionId,
        exerciseId,
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
        isPR: set.isPR,
        completedAt,
      })
      .onConflictDoUpdate({
        target: schema.setLogs.id,
        set: {
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe,
          isPR: set.isPR,
          completedAt,
        },
      })
      .run();
  } catch (err) {
    report(err);
  }
};

export const deleteSetLog = (
  sessionId: string,
  exerciseId: string,
  setNumber: number,
) => {
  try {
    // Matched on the set, not the id: rows written before ids were
    // deterministic still belong to this set.
    getDb()
      .delete(schema.setLogs)
      .where(
        and(
          eq(schema.setLogs.sessionId, sessionId),
          eq(schema.setLogs.exerciseId, exerciseId),
          eq(schema.setLogs.setNumber, setNumber),
        ),
      )
      .run();
  } catch (err) {
    report(err);
  }
};

/** Mirror one set's current state into its row. */
export const syncSetLog = (
  sessionId: string,
  exerciseId: string,
  set: WorkoutSet,
) => {
  if (set.completed && set.completedAt != null) {
    saveSetLog({ sessionId, exerciseId, set });
    return;
  }
  deleteSetLog(sessionId, exerciseId, set.setNumber);
};

/** Rewrite every completed set of a session; an upsert, so it is safe to repeat. */
export const saveSessionSetLogs = (
  sessionId: string,
  exercises: WorkoutExercise[],
) => {
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.completed || set.completedAt == null) continue;
      saveSetLog({ sessionId, exerciseId: exercise.exerciseId, set });
    }
  }
};

export const deleteSessionSetLogs = (sessionId: string) => {
  try {
    getDb()
      .delete(schema.setLogs)
      .where(eq(schema.setLogs.sessionId, sessionId))
      .run();
  } catch (err) {
    report(err);
  }
};
