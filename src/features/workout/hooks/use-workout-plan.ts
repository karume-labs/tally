import { useEffect, useRef, useState } from "react";
import { getSplitDayById, loadExercisesForSplitDay } from "@/db/split-days";
import { getTodaySplitDay } from "@/db/today";
import { useWorkoutSession } from "@/features/workout/hooks/use-workout-session";
import { isValidEquipment, isValidMuscleGroup } from "@/lib/utils";
import { endLiveWorkout } from "@/services/live-workout";
import { syncTodayWidget } from "@/services/sync-today-widget";
import { refreshWidgets } from "@/services/widget-refresh";
import { useWorkoutStore } from "@/stores/use-workout-store";

export interface WorkoutPlanInfo {
  dayName: string | null;
  isRest: boolean;
}

/**
 * Loads the plan for this visit and starts its session. A day id means the user
 * deliberately picked a skipped day's session; otherwise today's split decides.
 * `announce` is called once the plan exists, because the ongoing notification
 * needs a day name it cannot derive from the store.
 */
export const useWorkoutPlan = (
  dayId: string | undefined,
  announce: (dayName: string) => void,
): WorkoutPlanInfo => {
  const session = useWorkoutSession();
  const [info, setInfo] = useState<WorkoutPlanInfo>({
    dayName: null,
    isRest: false,
  });
  const loadedRef = useRef(false);

  // Load exactly once per visit, and only start a session after the rest-day
  // flag is known so opening this on a rest day cannot log a workout.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;
    (async () => {
      const day =
        dayId != null ? await getSplitDayById(dayId) : await getTodaySplitDay();
      if (cancelled) return;
      setInfo({
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
        announce(day.name);
        return;
      }
      const exercises = await loadExercisesForSplitDay(day.id);
      // The abandon guard below may have cancelled the session while this list
      // was loading; adding to a reset store would leave orphan exercises.
      if (cancelled) return;
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
      announce(day.name);
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
  }, [session, dayId, announce]);

  // A widget tap starts a session immediately, so an accidental tap followed by
  // leaving this screen would leave an empty session behind — the widget would
  // keep saying "Session in progress" and the row would sit unfinished in the db.
  // Anything with a logged set is the user's session and is kept.
  useEffect(() => {
    return () => {
      const live = useWorkoutStore.getState();
      if (live.sessionId == null || live.completedSets > 0) return;
      session.cancelSession();
      endLiveWorkout();
      syncTodayWidget(false).then(refreshWidgets);
    };
  }, [session]);

  return info;
};
