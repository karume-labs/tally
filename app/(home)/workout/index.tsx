import { and, eq } from "drizzle-orm";
import { Stack } from "expo-router";
import { Check, Clock, Flag, Plus, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  getActiveSplit,
  getTodayExercises,
  parseSchedule,
  todaySplitDayName,
} from "@/db/today";
import { useWorkoutSession } from "@/features/workout/hooks/useWorkoutSession";
import { NAV_THEME } from "@/lib/theme";
import { formatRestRemaining, formatVolume } from "@/lib/utils";
import { calculateSessionXP, calculateStreak } from "@/services/streak";
import {
  writeLast7Dots,
  writeStreakWidgetData,
  writeTodayWidgetData,
} from "@/services/widgetSync";
import { useStreakStore } from "@/stores/useStreakStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";

const THEME = NAV_THEME.dark;
const CARD_BG = "#1a1a2e";
const BORDER = "#2a2a40";
const WORKOUT = "#4ade80";
const MUTED = "#9ca3af";
const FORE = "#e5e5e5";
const PR_COLOR = "#fbbf24";

export default function WorkoutScreen() {
  const store = useWorkoutStore();
  const session = useWorkoutSession();
  const streak = useStreakStore((s) => s.row);
  const addXP = useStreakStore((s) => s.addXP);
  const logWorkoutDay = useStreakStore((s) => s.logWorkoutDay);
  const refreshMilestones = useStreakStore((s) => s.refreshMilestones);

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [rpeInput, setRpeInput] = useState("");
  const [restCountdown, setRestCountdown] = useState<string>("");
  const [restEnabled, setRestEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startedAt = store.startedAt;
  const elapsed =
    startedAt != null ? Math.floor((Date.now() - startedAt) / 1000) : 0;

  // Determine today's split day name + rest flag from the active split.
  const todayInfo = useMemo(() => {
    let dayName: string | null = null;
    let isRest = false;
    getActiveSplit().then((split) => {
      if (!split) return;
      const schedule = parseSchedule(split.schedule);
      dayName = todaySplitDayName(schedule);
      isRest = dayName != null && dayName.toLowerCase() === "rest";
    });
    return { dayName, isRest };
  }, []);

  // Start the session on first render if not already started.
  const needsStart = store.sessionId == null && !todayInfo.isRest;
  useEffect(() => {
    if (!needsStart) return;
    let _cancelled = false;
    (async () => {
      const split = await getActiveSplit();
      const dayName = split
        ? todaySplitDayName(parseSchedule(split.schedule))
        : null;
      session.startSession(split?.id ?? null, dayName);
      // Pre-load today's exercises from the active split.
      if (split && dayName && dayName.toLowerCase() !== "rest") {
        const exercises = await getTodayExercisesFromSplit(split.id, dayName);
        for (const ex of exercises) {
          session.addExercise({
            exerciseId: ex.id,
            name: ex.name,
            muscleGroup:
              ex.muscleGroup as import("@/lib/constants").MuscleGroup,
            equipment: ex.equipment as
              | import("@/lib/constants").Equipment
              | null,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            restSeconds: ex.restSeconds,
            notes: ex.notes,
            sets: [],
          });
        }
      }
    })();
    return () => {
      _cancelled = true;
    };
  }, [needsStart, session]);

  // Auto-start rest timer when a set completes.
  useEffect(() => {
    const ex = activeExerciseId
      ? store.exercises.find((e) => e.exerciseId === activeExerciseId)
      : null;
    if (ex && ex.restSeconds > 0) {
      setRestEnabled(true);
      const endsAt = Date.now() + ex.restSeconds * 1000;
      session.setRestTimer(endsAt);
      setRestCountdown(formatRestRemaining(endsAt));
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRestEnabled(false);
          setRestCountdown("0:00");
          session.setRestTimer(null);
        } else {
          setRestCountdown(formatRestRemaining(endsAt));
        }
      }, 250);
    } else {
      setRestEnabled(false);
      setRestCountdown("");
      session.setRestTimer(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeExerciseId, store.exercises, session]);

  const activeExercise = activeExerciseId
    ? store.exercises.find((e) => e.exerciseId === activeExerciseId)
    : null;

  const lastSet =
    activeExercise && activeExercise.sets.length > 0
      ? activeExercise.sets[activeExercise.sets.length - 1]
      : null;

  const nextSetNumber = activeExercise ? activeExercise.sets.length + 1 : 1;

  const logSet = useCallback(() => {
    if (!activeExerciseId) return;
    const weight = weightInput.trim() === "" ? null : parseFloat(weightInput);
    const reps = repsInput.trim() === "" ? null : parseInt(repsInput, 10);
    const rpe = rpeInput.trim() === "" ? null : parseFloat(rpeInput);
    if (weight == null || reps == null) return;

    const completedAt = Date.now();
    const logged = store.logSet(
      activeExerciseId,
      nextSetNumber,
      weight,
      reps,
      rpe,
      completedAt,
    );
    if (!logged) return;

    // Reset inputs for the next set.
    setWeightInput("");
    setRepsInput("");
    setRpeInput("");

    const ex = store.exercises.find((e) => e.exerciseId === activeExerciseId);
    if (ex && ex.restSeconds > 0) {
      // Rest timer is driven by the useEffect above; just ensure the state is fresh.
    }
  }, [
    activeExerciseId,
    nextSetNumber,
    weightInput,
    repsInput,
    rpeInput,
    store,
  ]);

  const _completeSetOnly = useCallback(() => {
    if (!activeExerciseId) return;
    store.completeSet(activeExerciseId, nextSetNumber);
  }, [activeExerciseId, nextSetNumber, store]);

  const finish = useCallback(async () => {
    if (!store.sessionId) return;
    const result = session.finishSession();

    // Persist streak + XP.
    const xpResult = calculateSessionXP(50, result.prCount, 0, 0);
    const dayKey =
      todaySplitDayName(
        parseSchedule((await getActiveSplit())?.schedule ?? "{}"),
      ) ?? "";
    if (dayKey) {
      const streakResult = calculateStreak(
        streak?.currentStreak ?? 0,
        streak?.longestStreak ?? 0,
        streak?.lastLogDayKey ?? null,
        dayKey,
        "workout",
        6,
      );
      if (streakResult.streakChanged || result.prCount > 0) {
        // Update the DB streak row.
        const db = getDb();
        await db
          .update(schema.streakState)
          .set({
            currentStreak: streakResult.newCurrentStreak,
            longestStreak: streakResult.newLongestStreak,
            lastLogDayKey: dayKey,
            xp: (streak?.xp ?? 0) + xpResult.totalXP,
            level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
            totalSessions: (streak?.totalSessions ?? 0) + 1,
            totalVolume: (streak?.totalVolume ?? 0) + result.totalVolume,
          })
          .where(eq(schema.streakState.id, 1))
          .run();

        // Update in-memory streak store.
        useStreakStore.getState().setRow({
          id: 1,
          currentStreak: streakResult.newCurrentStreak,
          longestStreak: streakResult.newLongestStreak,
          lastLogDayKey: dayKey,
          freezesAvailable: streak?.freezesAvailable ?? 0,
          freezesUsed: streak?.freezesUsed ?? 0,
          xp: (streak?.xp ?? 0) + xpResult.totalXP,
          level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
          totalSessions: (streak?.totalSessions ?? 0) + 1,
          totalVolume: (streak?.totalVolume ?? 0) + result.totalVolume,
        });

        addXP(
          xpResult.totalXP,
          "session_complete",
          `Workout complete — ${result.durationSeconds}s`,
          crypto.randomUUID(),
        );
        logWorkoutDay(dayKey, xpResult.totalXP, store.sessionId, "workout");
        refreshMilestones();

        // Sync widgets.
        writeStreakWidgetData({
          current: streakResult.newCurrentStreak,
          longest: streakResult.newLongestStreak,
          level: Math.floor(((streak?.xp ?? 0) + xpResult.totalXP) / 500) + 1,
          xp: (streak?.xp ?? 0) + xpResult.totalXP,
          updatedAt: Date.now(),
        });
        writeLast7Dots([]);
      }
    }

    // Sync today widget.
    const exercises = await getTodayExercises();
    writeTodayWidgetData({
      dayName: todayInfo.dayName,
      exerciseCount: exercises?.length ?? 0,
      exerciseNames: exercises?.map((e) => e.name) ?? [],
      isRestDay: todayInfo.isRest,
      sessionActive: false,
      updatedAt: Date.now(),
    });
  }, [
    store,
    session,
    streak,
    todayInfo.dayName,
    todayInfo.isRest,
    addXP,
    logWorkoutDay,
    refreshMilestones,
  ]);

  const _startButton = useCallback(() => {
    // Handled by useEffect above; this is a fallback UI hook.
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text style={styles.elapsed}>{formatDuration(elapsed)}</Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Session header */}
          <View style={styles.card}>
            <View style={styles.sessionRow}>
              <View style={styles.sessionStat}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statValue}>
                  {formatVolume(store.totalVolume)}
                </Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={styles.statLabel}>Sets</Text>
                <Text style={styles.statValue}>{store.completedSets}</Text>
              </View>
            </View>
            {store.sessionId && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  session.reset();
                }}
                style={styles.cancelButton}
              >
                <X size={14} />
                <Text style={styles.cancelText}>Cancel session</Text>
              </Button>
            )}
          </View>

          {/* Exercise list */}
          {store.exercises.map((ex) => {
            const isActive = ex.exerciseId === activeExerciseId;
            const last = ex.sets[ex.sets.length - 1];
            return (
              <View key={ex.exerciseId} style={styles.exCard}>
                <View style={styles.exHeader}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  {ex.targetSets != null && ex.targetReps != null && (
                    <Text style={styles.exTarget}>
                      {ex.targetSets} × {ex.targetReps}
                    </Text>
                  )}
                </View>

                {ex.sets.map((set) => {
                  const _isLast = set.setNumber === ex.sets.length;
                  return (
                    <View
                      key={set.setNumber}
                      style={[styles.setRow, isActive && styles.setRowActive]}
                    >
                      <Text style={styles.setNum}>Set {set.setNumber}</Text>
                      <View style={styles.setInputs}>
                        <TextInput
                          style={styles.setInput}
                          keyboardType="decimal-pad"
                          placeholder="kg"
                          placeholderTextColor={MUTED}
                          value={
                            set.setNumber === lastSet?.setNumber
                              ? weightInput
                              : ""
                          }
                          onChangeText={
                            set.setNumber === lastSet?.setNumber
                              ? setWeightInput
                              : () => {}
                          }
                          editable={set.setNumber === lastSet?.setNumber}
                        />
                        <Text style={styles.inputSep}>×</Text>
                        <TextInput
                          style={styles.setInput}
                          keyboardType="decimal-pad"
                          placeholder="reps"
                          placeholderTextColor={MUTED}
                          value={
                            set.setNumber === lastSet?.setNumber
                              ? repsInput
                              : ""
                          }
                          onChangeText={
                            set.setNumber === lastSet?.setNumber
                              ? setRepsInput
                              : () => {}
                          }
                          editable={set.setNumber === lastSet?.setNumber}
                        />
                        <Text style={styles.inputSep}>@</Text>
                        <TextInput
                          style={[styles.setInput, styles.rpeInput]}
                          keyboardType="decimal-pad"
                          placeholder="RPE"
                          placeholderTextColor={MUTED}
                          value={
                            set.setNumber === lastSet?.setNumber ? rpeInput : ""
                          }
                          onChangeText={
                            set.setNumber === lastSet?.setNumber
                              ? setRpeInput
                              : () => {}
                          }
                          editable={set.setNumber === lastSet?.setNumber}
                        />
                      </View>
                      <View style={styles.setRight}>
                        {set.completed && (
                          <View style={styles.setDone}>
                            <Check size={16} color={WORKOUT} />
                            <Text style={styles.setDoneText}>
                              {formatVolume(
                                set.weight != null && set.reps != null
                                  ? set.weight * set.reps
                                  : null,
                              )}
                            </Text>
                          </View>
                        )}
                        {set.isPR && (
                          <View style={styles.prBadge}>
                            <Flag size={12} color={PR_COLOR} />
                            <Text style={styles.prText}>PR</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}

                {isActive && (
                  <View style={styles.setAdder}>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="decimal-pad"
                      placeholder="kg"
                      placeholderTextColor={MUTED}
                      value={weightInput}
                      onChangeText={setWeightInput}
                    />
                    <Text style={styles.inputSep}>×</Text>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="decimal-pad"
                      placeholder="reps"
                      placeholderTextColor={MUTED}
                      value={repsInput}
                      onChangeText={setRepsInput}
                    />
                    <Text style={styles.inputSep}>@</Text>
                    <TextInput
                      style={[styles.setInput, styles.rpeInput]}
                      keyboardType="decimal-pad"
                      placeholder="RPE"
                      placeholderTextColor={MUTED}
                      value={rpeInput}
                      onChangeText={setRpeInput}
                    />
                    <Button
                      size="sm"
                      variant="default"
                      onPress={logSet}
                      style={styles.logButton}
                    >
                      <Plus size={14} />
                      <Text style={styles.logButtonText}>Log</Text>
                    </Button>
                  </View>
                )}

                {isActive && last?.completed && ex.restSeconds > 0 && (
                  <View style={styles.restRow}>
                    <Clock size={14} color={WORKOUT} />
                    <Text style={styles.restText}>Rest {restCountdown}</Text>
                    {restEnabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          session.skipRest();
                          setRestEnabled(false);
                          setRestCountdown("");
                          if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                          }
                        }}
                      >
                        <Text style={styles.skipText}>Skip</Text>
                      </Button>
                    )}
                  </View>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    setActiveExerciseId(isActive ? null : ex.exerciseId)
                  }
                  style={
                    isActive
                      ? [styles.selectButton, styles.selectButtonActive]
                      : styles.selectButton
                  }
                >
                  <Text style={styles.selectButtonText}>
                    {isActive ? "Deselect" : "Log sets"}
                  </Text>
                </Button>
              </View>
            );
          })}

          {store.exercises.length === 0 && startedAt == null && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Loading workout…</Text>
              <Text style={styles.emptySubtitle}>
                Fetching today's exercises from your active split.
              </Text>
            </View>
          )}

          {store.exercises.length === 0 && startedAt != null && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No exercises</Text>
              <Text style={styles.emptySubtitle}>
                Add exercises to start logging sets.
              </Text>
            </View>
          )}

          {/* Finish */}
          {store.sessionId && store.exercises.length > 0 && (
            <Button
              size="lg"
              variant="default"
              onPress={finish}
              style={styles.finishButton}
            >
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  keyboardView: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  elapsed: { fontSize: 14, fontWeight: "600", color: MUTED },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sessionRow: { flexDirection: "row", justifyContent: "space-between" },
  sessionStat: { alignItems: "center" },
  statLabel: {
    fontSize: 11,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: FORE, marginTop: 2 },
  cancelButton: { marginTop: 8, alignSelf: "flex-start" },
  cancelText: { color: MUTED },
  exCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  exHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exName: { fontSize: 16, fontWeight: "600", color: FORE, flex: 1 },
  exTarget: { fontSize: 13, color: MUTED },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    gap: 8,
  },
  setRowActive: { backgroundColor: "#1a1a2e" },
  setNum: { fontSize: 12, color: MUTED, width: 48 },
  setInputs: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  setInput: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: FORE,
    width: 64,
    textAlign: "center",
  },
  rpeInput: { width: 48 },
  inputSep: { color: MUTED, fontSize: 12 },
  setRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  setDone: { flexDirection: "row", alignItems: "center", gap: 4 },
  setDoneText: { fontSize: 12, color: MUTED, fontWeight: "600" },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prText: { fontSize: 11, fontWeight: "700", color: PR_COLOR },
  setAdder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  logButton: { marginLeft: 4 },
  logButtonText: { fontSize: 13, fontWeight: "700" },
  restRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  restText: { fontSize: 14, fontWeight: "600", color: WORKOUT, flex: 1 },
  skipButton: { marginLeft: "auto" },
  skipText: { color: MUTED, fontSize: 13 },
  selectButton: { marginTop: 4 },
  selectButtonActive: { borderWidth: 1, borderColor: WORKOUT },
  selectButtonText: { color: MUTED },
  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: FORE, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: MUTED, textAlign: "center" },
  finishButton: { marginTop: 8, backgroundColor: WORKOUT, borderRadius: 12 },
  finishButtonText: { color: "#0a0a14", fontWeight: "700", fontSize: 16 },
});

async function getTodayExercisesFromSplit(splitId: string, dayName: string) {
  const db = getDb();
  const days = await db
    .select()
    .from(schema.splitDays)
    .where(
      and(
        eq(schema.splitDays.splitId, splitId),
        eq(schema.splitDays.name, dayName),
      ),
    )
    .limit(1);
  if (days.length === 0) return [];
  const splitDay = days[0];
  const sdeRows = await db
    .select()
    .from(schema.splitDayExercises)
    .where(eq(schema.splitDayExercises.splitDayId, splitDay.id))
    .orderBy(schema.splitDayExercises.order);
  const exercises: import("@/db/today").TodayExercise[] = [];
  for (const sde of sdeRows) {
    const exRows = await db
      .select()
      .from(schema.exercises)
      .where(eq(schema.exercises.id, sde.exerciseId))
      .limit(1);
    const ex = exRows[0];
    if (!ex) continue;
    exercises.push({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      targetSets: sde.targetSets,
      targetReps: sde.targetReps,
      restSeconds: sde.restSeconds ?? 90,
      notes: sde.notes ?? "",
      order: sde.order ?? 0,
    });
  }
  return exercises.sort(
    (
      a: import("@/db/today").TodayExercise,
      b: import("@/db/today").TodayExercise,
    ) => a.order - b.order,
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
