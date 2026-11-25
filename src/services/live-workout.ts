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
  /** Session start, used as the chronometer base while training. */
  startedAt: number;
  dayName: string;
  /** The exercise card that is open, which is what the title shows. */
  exerciseName: string | null;
  completedSets: number;
  totalSets: number;
  nextName: string | null;
  /** Set while resting; the chronometer counts down to it. */
  restEndsAt: number | null;
}

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

const isAndroid = Platform.OS === "android";

let state: LiveWorkoutState | null = null;
let channelReady = false;

// Android is the only platform with a persistent, live surface for this. iOS
// has no ongoing notification: a posted notification is static, and the Lock
// Screen / Dynamic Island version is an ActivityKit Live Activity, which needs
// a widget extension in the native project (SDK 56+ exposes that through
// expo-widgets' createLiveActivity). Every call below is therefore a no-op on
// iOS until that target exists, rather than pretending to show something.
if (isAndroid) {
  // The service needs a runner before a notification can hold it. It never
  // settles on purpose: endLiveWorkout stops the service instead.
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

const isResting = (current: LiveWorkoutState): boolean =>
  current.restEndsAt != null && current.restEndsAt > Date.now();

const bodyFor = (current: LiveWorkoutState): string => {
  const progress = `${current.completedSets} of ${current.totalSets} sets`;
  if (isResting(current)) {
    return current.nextName == null
      ? `Resting · ${progress}`
      : `Resting · ${current.nextName} up next`;
  }
  if (current.nextName == null) return `${progress} · all sets logged`;
  return `${progress} · ${current.nextName} up next`;
};

const post = async (current: LiveWorkoutState) => {
  await ensureChannel();
  const max = Math.max(current.totalSets, 1);
  const resting = isResting(current);
  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: current.exerciseName ?? current.dayName,
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
      // One chronometer can only do one job: while resting it counts the rest
      // down, otherwise it counts the session up. Android renders both itself,
      // so they keep ticking when the app is backgrounded.
      showChronometer: true,
      chronometerDirection: resting ? "down" : "up",
      timestamp: resting
        ? (current.restEndsAt ?? current.startedAt)
        : current.startedAt,
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
  state = { ...input, completedSets: 0, restEndsAt: null };
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
