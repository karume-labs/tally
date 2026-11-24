import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { REST_NOTIFICATION_ID } from "@/lib/constants";

const REST_CHANNEL_ID = "rest-timer";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: Platform.OS === "android",
    shouldShowList: Platform.OS === "android",
  }),
});

let channelReady = false;

const ensurePermission = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const ensureChannel = async (): Promise<void> => {
  if (Platform.OS !== "android" || channelReady) return;
  await Notifications.setNotificationChannelAsync(REST_CHANNEL_ID, {
    name: "Rest timer",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelReady = true;
};

export async function scheduleRestNotification(
  endsAtMs: number,
  exerciseName: string,
) {
  const seconds = Math.max(1, Math.round((endsAtMs - Date.now()) / 1000));
  try {
    if (!(await ensurePermission())) return;
    await ensureChannel();
    // One rest timer at a time: replace any earlier alert.
    await cancelRestNotification();
    await Notifications.scheduleNotificationAsync({
      identifier: String(REST_NOTIFICATION_ID),
      content: {
        title: "Rest complete",
        body: `Time for ${exerciseName}.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: REST_CHANNEL_ID,
      },
    });
  } catch (err) {
    console.warn("[tally.notifications] rest notification failed:", err);
  }
}

export async function cancelRestNotification() {
  await Notifications.cancelScheduledNotificationAsync(
    String(REST_NOTIFICATION_ID),
  );
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
