import { and, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { useWorkoutStore } from "@/stores/use-workout-store";

export interface SessionCleanup {
  discarded: number;
  closed: number;
}

/**
 * A session row is created when the workout starts and closed when it finishes,
 * so one still open at boot can only be a session the app never got to finish:
 * killed mid-workout, or a screen that went away without its unmount guard.
 * History reads only closed sessions, so such a row is invisible where it
 * belongs and misleading everywhere else.
 *
 * Nothing can be in memory at boot, which makes this the one safe moment to
 * settle them: a session with no logged sets never happened and is dropped, and
 * one with sets is closed at its last set so the work is kept.
 */
export const cleanupAbandonedSessions = async (): Promise<SessionCleanup> => {
  const db = getDb();
  // A reload in development re-runs bootstrap with the session still in the
  // store, and that session is the user's live one, not an abandoned row.
  const liveSessionId = useWorkoutStore.getState().sessionId;
  const open = await db
    .select({ id: schema.sessions.id, startedAt: schema.sessions.startedAt })
    .from(schema.sessions)
    .where(
      liveSessionId == null
        ? isNull(schema.sessions.endedAt)
        : and(
            isNull(schema.sessions.endedAt),
            ne(schema.sessions.id, liveSessionId),
          ),
    );

  let discarded = 0;
  let closed = 0;

  for (const session of open) {
    const logs = await db
      .select({
        weight: schema.setLogs.weight,
        reps: schema.setLogs.reps,
        isPR: schema.setLogs.isPR,
        completedAt: schema.setLogs.completedAt,
      })
      .from(schema.setLogs)
      .where(eq(schema.setLogs.sessionId, session.id));

    if (logs.length === 0) {
      // set_logs cascades on delete, but foreign keys are not guaranteed on, so
      // the rows are removed explicitly rather than trusted to the constraint.
      await db
        .delete(schema.setLogs)
        .where(eq(schema.setLogs.sessionId, session.id))
        .run();
      await db
        .update(schema.streakHistory)
        .set({ sessionId: null })
        .where(eq(schema.streakHistory.sessionId, session.id))
        .run();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.id, session.id))
        .run();
      discarded += 1;
      continue;
    }

    const lastSetAt = Math.max(...logs.map((log) => log.completedAt.getTime()));
    // A clock change mid-session could put a set before the start.
    const endedAtMs = Math.max(lastSetAt, session.startedAt.getTime());
    const totalVolume = logs.reduce(
      (sum, log) => sum + (log.weight ?? 0) * (log.reps ?? 0),
      0,
    );

    await db
      .update(schema.sessions)
      .set({
        endedAt: new Date(endedAtMs),
        durationSeconds: Math.floor(
          (endedAtMs - session.startedAt.getTime()) / 1000,
        ),
        totalVolume,
        prCount: logs.filter((log) => log.isPR === true).length,
      })
      .where(eq(schema.sessions.id, session.id))
      .run();
    closed += 1;
  }

  return { discarded, closed };
};
