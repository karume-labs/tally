import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";
import { RestTimerBar } from "@/components/shared/RestTimerBar";
import { Text } from "@/components/ui/text";
import { getSplitDayById, loadExercisesForSplitDay } from "@/db/split-days";
import { getTodaySplitDay } from "@/db/today";
import { EmptyStateCard } from "@/features/workout/components/EmptyStateCard";
import { SessionStatsCard } from "@/features/workout/components/SessionStatsCard";
import { WorkoutExerciseCard } from "@/features/workout/components/WorkoutExerciseCard";
import { WorkoutFooter } from "@/features/workout/components/WorkoutFooter";
import { useAutoAdvance } from "@/features/workout/hooks/use-auto-advance";
import { useWorkoutSession } from "@/features/workout/hooks/use-workout-session";
import { finishWorkout } from "@/features/workout/services/finish-workout";
import {
  isSessionComplete,
  pickNextExercise,
  sessionSetTotal,
} from "@/features/workout/services/next-exercise";
import { isValidEquipment, isValidMuscleGroup } from "@/lib/utils";
import {
  endLiveWorkout,
  startLiveWorkout,
  updateLiveWorkout,
} from "@/services/live-workout";
import {
  cancelRestNotification,
  scheduleRestNotification,
} from "@/services/notifications";
import { syncTodayWidget } from "@/services/sync-today-widget";
import { refreshWidgets } from "@/services/widget-refresh";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

export default function WorkoutScreen() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId?: string }>();
  const insets = useSafeAreaInsets();
  const store = useWorkoutStore();
  const session = useWorkoutSession();
  const rolloverHour = useSettingsStore((s) => s.settings.rolloverHour);
  const autoAdvance = useSettingsStore((s) => s.settings.autoAdvance);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const [todayInfo, setTodayInfo] = useState<{
    dayName: string | null;
    isRest: boolean;
  }>({ dayName: null, isRest: false });
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const loadedRef = useRef(false);

  // Rebuilds the ongoing-notification from the store, so calling it again after
  // a remount just replaces the same notification instead of stacking one.
  const announceLiveWorkout = useCallback((dayName: string) => {
    const running = useWorkoutStore.getState();
    if (running.startedAt == null) return;
    const first = pickNextExercise(running.exercises, null);
    startLiveWorkout({
      startedAt: running.startedAt,
      dayName,
      totalSets: sessionSetTotal(running.exercises),
      // The mirror effect below fills the focused exercise in as soon as one is
      // open, including on this render.
      exerciseName: null,
      nextName: first == null ? null : first.name,
    });
  }, []);

  // Load the plan exactly once per visit, and only start a session after the
  // rest-day flag is known so opening this on a rest day cannot log a workout.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;
    (async () => {
      // A day id means the user deliberately picked a skipped day's session.
      const day =
        dayId != null ? await getSplitDayById(dayId) : await getTodaySplitDay();
      if (cancelled) return;
      setTodayInfo({
        dayName: day?.name ?? null,
        isRest: day?.isRestDay === true,
      });
      if (day == null || day.isRestDay) return;

      const open = useWorkoutStore.getState();
      // Another day's session may still be in memory; reusing it would log this
      // day's sets under that split day, so the old one is abandoned.
      if (open.sessionId != null && open.splitDayId !== day.id) {
        session.cancelSession();
      }
      if (useWorkoutStore.getState().sessionId == null) {
        session.startSession(day.id, day.name);
      }
      // A remount (Fast Refresh, returning from the summary) reuses the store
      // session, so only hydrate the plan when it has not been hydrated yet.
      if (useWorkoutStore.getState().exercises.length > 0) {
        announceLiveWorkout(day.name);
        return;
      }
      const exercises = await loadExercisesForSplitDay(day.id);
      for (const ex of exercises) {
        const muscleGroup = isValidMuscleGroup(ex.muscleGroup)
          ? ex.muscleGroup
          : "full_body";
        const equipment =
          ex.equipment != null && isValidEquipment(ex.equipment)
            ? ex.equipment
            : null;
        session.addExercise({
          exerciseId: ex.id,
          name: ex.name,
          muscleGroup,
          equipment,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          sets: [],
        });
      }
      announceLiveWorkout(day.name);
      // Only today's session belongs on the Today widget; a made-up day is
      // logged but does not relabel the widget as today's plan.
      if (dayId == null) {
        await syncTodayWidget(true);
        refreshWidgets();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, dayId, announceLiveWorkout]);

  const startedAt = store.startedAt;
  useEffect(() => {
    if (startedAt == null) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const activeExercise =
    activeExerciseId != null
      ? store.exercises.find((ex) => ex.exerciseId === activeExerciseId)
      : null;
  const nextSetNumber = activeExercise ? activeExercise.sets.length + 1 : 1;
  const restExerciseName = activeExercise?.name ?? "your next set";

  // Keep the scheduled alert in step with the in-app rest timer, including
  // when the app is backgrounded or killed during a rest.
  useEffect(() => {
    const endsAt = store.restTimerEndsAt;
    if (endsAt == null) return;
    scheduleRestNotification(endsAt, restExerciseName);
    return () => {
      cancelRestNotification();
    };
  }, [store.restTimerEndsAt, restExerciseName]);

  const logSet = () => {
    if (activeExercise == null) return;
    const parsedWeight = weight.trim() === "" ? null : Number(weight);
    const parsedReps = reps.trim() === "" ? null : Number.parseInt(reps, 10);
    if (
      parsedWeight == null ||
      parsedReps == null ||
      Number.isNaN(parsedWeight) ||
      Number.isNaN(parsedReps)
    ) {
      return;
    }
    const parsedRpe = rpe.trim() === "" ? null : Number(rpe);
    const logged = store.logSet(
      activeExercise.exerciseId,
      nextSetNumber,
      parsedWeight,
      parsedReps,
      parsedRpe,
      Date.now(),
    );
    if (logged == null) return;
    // Weight and reps stay put for the next set: repeating the same numbers is
    // the common case, and hands-free mode should not need a retype.
    setRpe("");
  };

  const finish = async () => {
    const sessionId = store.sessionId;
    if (sessionId == null || finishing) return;
    setFinishing(true);
    try {
      const result = session.finishSession();
      await finishWorkout({
        sessionId,
        result,
        rolloverHour,
      });
      router.replace("/workout/summary");
    } catch (err) {
      // The session is already closed in memory, so surface the failure rather
      // than leaving the screen on a button that no longer responds.
      console.error("[workout] finish failed:", err);
    } finally {
      await endLiveWorkout();
      setFinishing(false);
    }
  };

  const cancel = () => {
    Alert.alert(
      "Cancel this session?",
      "Nothing logged so far will be saved.",
      [
        { text: "Keep going", style: "cancel" },
        {
          text: "Cancel session",
          style: "destructive",
          onPress: () => {
            session.cancelSession();
            endLiveWorkout();
            syncTodayWidget(false).then(refreshWidgets);
            goBackOrToday();
          },
        },
      ],
    );
  };

  // The widget deep-links here on a cold start, where there is no screen to
  // go back to; fall back to the Today tab instead of leaving the app.
  const goBackOrToday = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/today");
  };

  const handleRestEnd = useCallback(() => {
    // The banner is derived from the store, so clearing the timer also clears
    // the "Rest complete" state on the next render.
    useWorkoutStore.getState().skipRest();
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {
          // Haptics are best-effort.
        },
      );
    }
  }, [hapticsEnabled]);

  useAutoAdvance({
    enabled: autoAdvance,
    exercises: store.exercises,
    activeExerciseId,
    restTimerEndsAt: store.restTimerEndsAt,
    onAdvance: setActiveExerciseId,
    onRestEnd: handleRestEnd,
  });

  // Opening an exercise seeds the inputs from its last logged set, so a whole
  // exercise is one tap per set once the first numbers are in.
  useEffect(() => {
    if (activeExerciseId == null) return;
    const exercise = useWorkoutStore
      .getState()
      .exercises.find((row) => row.exerciseId === activeExerciseId);
    const last = exercise?.sets[exercise.sets.length - 1];
    setWeight(last?.weight != null ? String(last.weight) : "");
    setReps(last?.reps != null ? String(last.reps) : "");
    setRpe("");
  }, [activeExerciseId]);

  // Everything the ongoing notification shows is derived from the session, so
  // one effect pushes it: the title follows the open exercise, and while a rest
  // is running its deadline takes over the chronometer as a countdown.
  useEffect(() => {
    if (store.sessionId == null) return;
    const next = pickNextExercise(store.exercises, activeExerciseId);
    updateLiveWorkout({
      completedSets: store.completedSets,
      totalSets: sessionSetTotal(store.exercises),
      exerciseName: activeExercise?.name ?? null,
      nextName: next == null ? null : next.name,
      restEndsAt: store.restTimerEndsAt,
    });
  }, [
    store.sessionId,
    store.exercises,
    store.completedSets,
    store.restTimerEndsAt,
    activeExercise,
    activeExerciseId,
  ]);

  const nextUp = pickNextExercise(store.exercises, activeExerciseId);
  const nextUpName =
    nextUp != null && nextUp.exerciseId !== activeExerciseId
      ? nextUp.name
      : null;
  const allDone = isSessionComplete(store.exercises);

  const skipRest = () => {
    handleRestEnd();
    if (!autoAdvance) return;
    const next = pickNextExercise(store.exercises, activeExerciseId);
    if (next != null) setActiveExerciseId(next.exerciseId);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 pb-8">
        <Stack.Screen
          options={{
            headerRight: () => (
              <View className="flex-row items-center gap-3">
                <Text className="text-sm font-semibold text-muted-foreground">
                  {formatElapsed(elapsed)}
                </Text>
                {store.sessionId != null && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel session"
                    onPress={cancel}
                    className="rounded-lg border border-border px-2.5 py-1 active:opacity-70"
                  >
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Cancel
                    </Text>
                  </Pressable>
                )}
              </View>
            ),
          }}
        />

        {todayInfo.dayName == null ? (
          <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
            <Text className="text-base font-semibold">No active split</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Choose a split first so Tally knows what to put in your workout.
            </Text>
            <ActionButton
              label="Browse splits"
              onPress={() => router.replace("/splits")}
            />
          </View>
        ) : todayInfo.isRest ? (
          <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
            <Text className="text-base font-semibold">Rest day</Text>
            <Text className="text-center text-sm text-muted-foreground">
              {todayInfo.dayName} is scheduled as recovery. No session was
              started.
            </Text>
            <ActionButton
              variant="secondary"
              label="Back"
              onPress={goBackOrToday}
            />
          </View>
        ) : (
          <>
            <SessionStatsCard
              elapsed={elapsed}
              totalVolume={store.totalVolume}
              completedSets={store.completedSets}
            />

            {store.restTimerEndsAt != null && (
              <RestTimerBar
                endsAt={store.restTimerEndsAt}
                totalSeconds={
                  store.exercises.find(
                    (exercise) => exercise.exerciseId === activeExerciseId,
                  )?.restSeconds
                }
                nextName={nextUpName}
                onSkip={skipRest}
              />
            )}

            {store.exercises.map((exercise) => {
              const isActive = exercise.exerciseId === activeExerciseId;
              return (
                <WorkoutExerciseCard
                  key={exercise.exerciseId}
                  exercise={exercise}
                  isActive={isActive}
                  weight={isActive ? weight : ""}
                  reps={isActive ? reps : ""}
                  rpe={isActive ? rpe : ""}
                  onWeightChange={setWeight}
                  onRepsChange={setReps}
                  onRpeChange={setRpe}
                  onLogSet={logSet}
                  onToggleActive={() =>
                    setActiveExerciseId(isActive ? null : exercise.exerciseId)
                  }
                />
              );
            })}

            {allDone && autoAdvance && (
              <View className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
                <Text className="text-sm font-semibold text-primary">
                  Every set is logged. Finish when you're ready.
                </Text>
              </View>
            )}

            <EmptyStateCard
              hasExercises={store.exercises.length > 0}
              startedAt={store.startedAt}
            />
          </>
        )}
      </ScrollView>

      {todayInfo.dayName != null && !todayInfo.isRest && (
        // The keyboard can zero out the bottom inset, so keep a floor that
        // still clears the gesture bar.
        <View
          className="border-t border-border bg-background px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 20) + 20 }}
        >
          <WorkoutFooter
            hasSession={store.sessionId != null}
            hasExercises={store.exercises.length > 0}
            onFinish={finish}
          />
        </View>
      )}
    </View>
  );
}

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
