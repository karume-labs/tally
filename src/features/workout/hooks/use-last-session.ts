import { desc, eq, isNotNull } from "drizzle-orm";
import { useEffect, useState } from "react";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

export interface SummaryLog {
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  isPR: boolean | null;
}

export interface SummarySession {
  id: string;
  splitDayName: string | null;
  durationSeconds: number | null;
  totalVolume: number | null;
  prCount: number | null;
}

/**
 * The most recent finished session with its sets and exercise names. Open
 * sessions are skipped: anything not ended has no numbers worth showing.
 */
export const useLastSession = () => {
  const [session, setSession] = useState<SummarySession | null>(null);
  const [logs, setLogs] = useState<SummaryLog[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = getDb();
      const sessionRows = await db
        .select({
          id: schema.sessions.id,
          splitDayName: schema.sessions.splitDayName,
          durationSeconds: schema.sessions.durationSeconds,
          totalVolume: schema.sessions.totalVolume,
          prCount: schema.sessions.prCount,
        })
        .from(schema.sessions)
        .where(isNotNull(schema.sessions.endedAt))
        .orderBy(desc(schema.sessions.startedAt))
        .limit(1);

      const latest = sessionRows[0] ?? null;
      const logRows =
        latest == null
          ? []
          : await db
              .select({
                exerciseId: schema.setLogs.exerciseId,
                setNumber: schema.setLogs.setNumber,
                weight: schema.setLogs.weight,
                reps: schema.setLogs.reps,
                isPR: schema.setLogs.isPR,
              })
              .from(schema.setLogs)
              .where(eq(schema.setLogs.sessionId, latest.id))
              .orderBy(schema.setLogs.completedAt);

      const exerciseRows = await db
        .select({ id: schema.exercises.id, name: schema.exercises.name })
        .from(schema.exercises);
      const nameMap: Record<string, string> = {};
      for (const row of exerciseRows) {
        nameMap[row.id] = row.name;
      }

      if (cancelled) return;
      setSession(latest);
      setLogs(logRows);
      setNames(nameMap);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { session, logs, names, loading };
};
