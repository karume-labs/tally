import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { RestTimerBar } from "@/components/shared/RestTimerBar";
import { CancelSessionSheet } from "@/features/workout/components/CancelSessionSheet";
import { EmptyStateCard } from "@/features/workout/components/EmptyStateCard";
import { NoActiveSplitCard } from "@/features/workout/components/NoActiveSplitCard";
import { RestDayCard } from "@/features/workout/components/RestDayCard";
import { SessionCompleteBanner } from "@/features/workout/components/SessionCompleteBanner";
import { SessionStatsCard } from "@/features/workout/components/SessionStatsCard";
import { WorkoutExerciseList } from "@/features/workout/components/WorkoutExerciseList";
import { WorkoutFooter } from "@/features/workout/components/WorkoutFooter";
import { WorkoutNavHeader } from "@/features/workout/components/WorkoutNavHeader";
import { useElapsedSeconds } from "@/features/workout/hooks/use-elapsed-seconds";
import { useLiveWorkoutNotification } from "@/features/workout/hooks/use-live-workout-notification";
import { useRestTimer } from "@/features/workout/hooks/use-rest-timer";
import { useSessionExit } from "@/features/workout/hooks/use-session-exit";
import { useSetInputs } from "@/features/workout/hooks/use-set-inputs";
import { useSetToggle } from "@/features/workout/hooks/use-set-toggle";
import { useWorkoutPlan } from "@/features/workout/hooks/use-workout-plan";
import { isSessionComplete } from "@/features/workout/services/next-exercise";
import { registerLiveWorkoutHandlers } from "@/services/live-workout-actions";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

export default function WorkoutScreen() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId?: string }>();
  const store = useWorkoutStore();
  const autoAdvance = useSettingsStore((s) => s.settings.autoAdvance);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const activeExercise =
    activeExerciseId != null
      ? store.exercises.find((ex) => ex.exerciseId === activeExerciseId)
      : null;
  const activeRestSeconds = activeExercise?.restSeconds;
  const elapsed = useElapsedSeconds(store.startedAt);
  const announce = useLiveWorkoutNotification({
    sessionId: store.sessionId,
    exercises: store.exercises,
    completedSets: store.completedSets,
    restTimerEndsAt: store.restTimerEndsAt,
    activeExercise,
    activeExerciseId,
  });
  const { dayName, isRest } = useWorkoutPlan(dayId, announce);
  const inputs = useSetInputs(activeExerciseId);
  const toggleSet = useSetToggle();
  const { skipRest, nextName } = useRestTimer({
    exercises: store.exercises,
    activeExercise,
    activeExerciseId,
    restTimerEndsAt: store.restTimerEndsAt,
    autoAdvance,
    hapticsEnabled,
    onAdvance: setActiveExerciseId,
  });
  const {
    finish,
    cancel,
    confirmCancel,
    dismissCancel,
    askCancel,
    goBackOrToday,
  } = useSessionExit();

  const toggleActive = useCallback((exerciseId: string) => {
    setActiveExerciseId((current) =>
      current === exerciseId ? null : exerciseId,
    );
  }, []);

  // The notification's actions run the same handlers as the on-screen buttons,
  // so they clear the timer, advance focus and navigate exactly as a tap does.
  // Registering again after every change keeps them pointed at current state.
  useEffect(
    () => registerLiveWorkoutHandlers({ skipRest, finish }),
    [skipRest, finish],
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 pb-8">
        <WorkoutNavHeader
          elapsed={elapsed}
          showCancel={store.sessionId != null}
          onCancel={cancel}
        />

        {dayName == null ? (
          <NoActiveSplitCard onBrowseSplits={() => router.replace("/splits")} />
        ) : isRest ? (
          <RestDayCard dayName={dayName} onBack={goBackOrToday} />
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
                totalSeconds={activeRestSeconds}
                nextName={nextName}
                onSkip={skipRest}
              />
            )}

            <WorkoutExerciseList
              exercises={store.exercises}
              activeExerciseId={activeExerciseId}
              inputs={inputs}
              onToggleActive={toggleActive}
              onToggleSet={toggleSet}
            />

            {isSessionComplete(store.exercises) && autoAdvance && (
              <SessionCompleteBanner />
            )}

            <EmptyStateCard
              hasExercises={store.exercises.length > 0}
              startedAt={store.startedAt}
            />
          </>
        )}
      </ScrollView>

      {dayName != null && !isRest && (
        <WorkoutFooter
          hasSession={store.sessionId != null}
          hasExercises={store.exercises.length > 0}
          canFinish={store.completedSets > 0}
          onFinish={finish}
        />
      )}

      <CancelSessionSheet
        visible={askCancel}
        onConfirm={confirmCancel}
        onClose={dismissCancel}
      />
    </View>
  );
}
