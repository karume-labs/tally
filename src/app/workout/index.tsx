import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";
import { RestTimerBar } from "@/components/shared/RestTimerBar";
import { Text } from "@/components/ui/text";
import {
  getActiveSplit,
  getExercisesForDay,
  getTodaySplitDay,
} from "@/db/today";
import { EmptyStateCard } from "@/features/workout/components/EmptyStateCard";
import { SessionStatsCard } from "@/features/workout/components/SessionStatsCard";
import { WorkoutExerciseCard } from "@/features/workout/components/WorkoutExerciseCard";
import { WorkoutFooter } from "@/features/workout/components/WorkoutFooter";
import { useWorkoutSession } from "@/features/workout/hooks/use-workout-session";
import { finishWorkout } from "@/features/workout/services/finish-workout";
import { isValidEquipment, isValidMuscleGroup } from "@/lib/utils";
import {
  cancelRestNotification,
  scheduleRestNotification,
} from "@/services/notifications";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

export default function WorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useWorkoutStore();
  const session = useWorkoutSession();
  const rolloverHour = useSettingsStore((s) => s.settings.rolloverHour);
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

  // Load the plan exactly once per visit, and only start a session after the
  // rest-day flag is known so opening this on a rest day cannot log a workout.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;
    (async () => {
      const day = await getTodaySplitDay();
      if (cancelled) return;
      setTodayInfo({
        dayName: day?.name ?? null,
        isRest: day?.isRestDay === true,
      });
      if (day == null || day.isRestDay) return;

      if (useWorkoutStore.getState().sessionId == null) {
        session.startSession(day.id, day.name);
      }
      const split = await getActiveSplit();
      if (split == null) return;
      // A remount (Fast Refresh, returning from the summary) reuses the store
      // session, so only hydrate the plan when it has not been hydrated yet.
      if (useWorkoutStore.getState().exercises.length > 0) return;
      const exercises = await getExercisesForDay(split.id, day.name);
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
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

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
    setWeight("");
    setReps("");
    setRpe("");
  };

  const finish = async () => {
    const sessionId = store.sessionId;
    if (sessionId == null || finishing) return;
    setFinishing(true);
    const exerciseNames = store.exercises.map((ex) => ex.name);
    try {
      const result = session.finishSession();
      await finishWorkout({
        sessionId,
        result,
        rolloverHour,
        todayInfo,
        exerciseNames,
      });
      router.replace("/workout/summary");
    } catch (err) {
      // The session is already closed in memory, so surface the failure rather
      // than leaving the screen on a button that no longer responds.
      console.error("[workout] finish failed:", err);
    } finally {
      setFinishing(false);
    }
  };

  const cancel = () => {
    session.cancelSession();
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 pb-8">
        <Stack.Screen
          options={{
            headerRight: () => (
              <Text className="text-sm font-semibold text-muted-foreground">
                {formatElapsed(elapsed)}
              </Text>
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
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <>
            <SessionStatsCard
              elapsed={elapsed}
              totalVolume={store.totalVolume}
              completedSets={store.completedSets}
              hasSession={store.sessionId != null}
              onCancel={cancel}
            />

            {store.restTimerEndsAt != null && (
              <RestTimerBar
                endsAt={store.restTimerEndsAt}
                onSkip={store.skipRest}
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
