import { desc, eq, isNotNull } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatTile } from "@/components/shared/StatTile";
import { Text } from "@/components/ui/text";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { formatDuration, formatVolume } from "@/lib/utils";

interface SummaryLog {
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  isPR: boolean | null;
}

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const [session, setSession] = useState<{
    id: string;
    splitDayName: string | null;
    durationSeconds: number | null;
    totalVolume: number | null;
    prCount: number | null;
  } | null>(null);
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

  const grouped = useMemo(() => {
    const map = new Map<string, SummaryLog[]>();
    for (const log of logs) {
      const list = map.get(log.exerciseId);
      if (list) {
        list.push(log);
      } else {
        map.set(log.exerciseId, [log]);
      }
    }
    return Array.from(map.entries());
  }, [logs]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-10"
    >
      {session == null ? (
        <View className="items-center gap-2 rounded-2xl border border-border bg-card p-8">
          <Text className="text-base font-semibold">No workouts yet</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Finish a session and its numbers will land here.
          </Text>
          <ActionButton
            className="mt-2"
            label="Go home"
            onPress={() => router.replace("/")}
          />
        </View>
      ) : (
        <>
          <SectionCard
            title={
              session.splitDayName != null ? session.splitDayName : "Session"
            }
          >
            <View className="flex-row">
              <StatTile
                label="Duration"
                value={formatDuration(session.durationSeconds)}
              />
              <StatTile
                label="Volume"
                value={formatVolume(session.totalVolume)}
              />
              <StatTile label="PRs" value={`${session.prCount ?? 0}`} />
            </View>
          </SectionCard>

          {grouped.length === 0 ? (
            <SectionCard title="Sets">
              <Text className="text-sm text-muted-foreground">
                No completed sets were recorded.
              </Text>
            </SectionCard>
          ) : (
            grouped.map(([exerciseId, exerciseLogs]) => (
              <SectionCard
                key={exerciseId}
                title={names[exerciseId] ?? "Exercise"}
              >
                {exerciseLogs.map((log, index) => (
                  <View
                    key={`${log.exerciseId}-${log.setNumber}`}
                    className={
                      index === exerciseLogs.length - 1
                        ? "flex-row items-center gap-2 py-2"
                        : "flex-row items-center gap-2 border-b border-border py-2"
                    }
                  >
                    <Text className="w-12 text-xs text-muted-foreground">
                      Set {log.setNumber}
                    </Text>
                    <Text className="flex-1 text-sm font-semibold">
                      {log.weight != null ? `${log.weight} kg` : "—"} ×{" "}
                      {log.reps != null ? log.reps : "—"}
                    </Text>
                    {log.isPR === true && (
                      <Text className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        PR
                      </Text>
                    )}
                  </View>
                ))}
              </SectionCard>
            ))
          )}

          <ActionButton
            size="lg"
            label="Back to home"
            onPress={() => router.replace("/")}
          />
        </>
      )}
    </ScrollView>
  );
}
