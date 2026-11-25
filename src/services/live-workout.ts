import { Platform } from "react-native";
import notifee, {
  AndroidForegroundServiceType,
  AndroidImportance,
} from "react-native-notify-kit";

const CHANNEL_ID = "live-workout";
const NOTIFICATION_ID = "live-workout";
const SMALL_ICON = "ic_stat_tally";
const ACCENT = "#ffd340";

interface LiveWorkoutState {
  /** Session start, used as the chronometer base. */
  startedAt: number;
  dayName: string;
  completedSets: number;
  totalSets: number;
  nextName: string | null;
  resting: boolean;
}

interface LiveWorkoutStart {
  startedAt: number;
  dayName: string;
  totalSets: number;
  nextName: string | null;
}

interface LiveWorkoutUpdate {
  completedSets: number;
  totalSets: number;
  nextName: string | null;
  resting: boolean;
}

const isAndroid = Platform.OS === "android";

let state: LiveWorkoutState | null = null;
let channelReady = false;

// The service needs a runner before a notification can hold it. It never
// settles on purpose: endLiveWorkout stops the service instead.
if (isAndroid) {
  notifee.registerForegroundService(
    () =>
      new Promise<void>(() => {
        // Deliberately unresolved.
      }),
  );
}

const ensureChannel = async () => {
  if (channelReady) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Live workout",
    // Every logged set republishes the notification; it must stay silent.
    importance: AndroidImportance.LOW,
    vibration: false,
  });
  channelReady = true;
};

const bodyFor = (current: LiveWorkoutState): string => {
  const progress = `${current.completedSets} of ${current.totalSets} sets`;
  if (current.nextName == null) {
    return current.resting
      ? `${progress} · resting`
      : `${progress} · all sets in`;
  }
  return current.resting
    ? `${progress} · resting before ${current.nextName}`
    : `${progress} · ${current.nextName} up next`;
};

const post = async (current: LiveWorkoutState) => {
  await ensureChannel();
  const max = Math.max(current.totalSets, 1);
  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: current.dayName,
    body: bodyFor(current),
    android: {
      channelId: CHANNEL_ID,
      // Has to be repeated on every update, or the service stops.
      asForegroundService: true,
      foregroundServiceTypes: [
        AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_HEALTH,
      ],
      ongoing: true,
      onlyAlertOnce: true,
      smallIcon: SMALL_ICON,
      color: ACCENT,
      // Count-up chronometer from the session's first set.
      showChronometer: true,
      chronometerDirection: "up",
      timestamp: current.startedAt,
      showTimestamp: false,
      progress: {
        max,
        current: Math.min(current.completedSets, max),
        indeterminate: current.totalSets === 0,
      },
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
};

const report = (err: unknown) => {
  // A notification failure must never interrupt a workout.
  console.warn("[tally.liveWorkout] notification update failed:", err);
};

export const startLiveWorkout = async (input: LiveWorkoutStart) => {
  if (!isAndroid) return;
  state = { ...input, completedSets: 0, resting: false };
  try {
    await post(state);
  } catch (err) {
    report(err);
  }
};

export const updateLiveWorkout = async (patch: Partial<LiveWorkoutUpdate>) => {
  if (!isAndroid || state == null) return;
  state = { ...state, ...patch };
  try {
    await post(state);
  } catch (err) {
    report(err);
  }
};

export const endLiveWorkout = async () => {
  if (!isAndroid || state == null) return;
  state = null;
  try {
    await notifee.stopForegroundService();
  } catch (err) {
    report(err);
  }
};
