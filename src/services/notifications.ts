import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { REST_NOTIFICATION_ID } from "@/lib/constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: Platform.OS === "android",
    shouldShowList: Platform.OS === "android",
  }),
});

export async function scheduleRestNotification(
  _endsAtMs: number,
  _exerciseName: string,
) {
  // Rest timer notifications are not yet wired for background alerts.
  // The in-app rest timer (RestTimerBar) handles the countdown visually.
  return;
}

export async function cancelRestNotification() {
  await Notifications.cancelScheduledNotificationAsync(
    String(REST_NOTIFICATION_ID),
  );
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
