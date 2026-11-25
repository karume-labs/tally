import {
  isLiveWorkoutSupported,
  type LiveWorkoutState,
  showLiveWorkoutNotification,
  stopLiveWorkoutNotification,
} from "./live-workout-notification";

interface LiveWorkoutStart {
  startedAt: number;
  dayName: string;
  totalSets: number;
  exerciseName: string | null;
  nextName: string | null;
}

interface LiveWorkoutUpdate {
  completedSets: number;
  totalSets: number;
  exerciseName: string | null;
  nextName: string | null;
  restEndsAt: number | null;
}

let state: LiveWorkoutState | null = null;

const report = (err: unknown) => {
  // A notification failure must never interrupt a workout.
  console.warn("[tally.liveWorkout] notification update failed:", err);
};

export const startLiveWorkout = async (input: LiveWorkoutStart) => {
  if (!isLiveWorkoutSupported) return;
  state = { ...input, completedSets: 0, restEndsAt: null };
  try {
    await showLiveWorkoutNotification(state);
  } catch (err) {
    report(err);
  }
};

export const updateLiveWorkout = async (patch: Partial<LiveWorkoutUpdate>) => {
  if (!isLiveWorkoutSupported || state == null) return;
  state = { ...state, ...patch };
  try {
    await showLiveWorkoutNotification(state);
  } catch (err) {
    report(err);
  }
};

export const endLiveWorkout = async () => {
  if (!isLiveWorkoutSupported || state == null) return;
  state = null;
  try {
    await stopLiveWorkoutNotification();
  } catch (err) {
    report(err);
  }
};
