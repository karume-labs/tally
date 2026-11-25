import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type PermissionKey = "notifications";

export interface PermissionRow {
  key: PermissionKey;
  label: string;
  why: string;
  granted: boolean;
}

/** Only notifications are requested: rest-timer alerts and widgets need them. */
export const notificationsGranted = async (): Promise<boolean> => {
  try {
    const status = await Notifications.getPermissionsAsync();
    return status.granted;
  } catch (err) {
    console.warn("[tally.permissions] check failed:", err);
    return false;
  }
};

export const requestPermissions = async (): Promise<boolean> => {
  try {
    const status = await Notifications.getPermissionsAsync();
    if (status.granted) return true;
    if (!status.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (err) {
    console.warn("[tally.permissions] request failed:", err);
    return false;
  }
};

export const permissionRows = (granted: boolean): PermissionRow[] => [
  {
    key: "notifications",
    label: "Notifications",
    why:
      Platform.OS === "android"
        ? "Rest-timer alerts and streak reminders, including while the app is closed."
        : "Rest-timer alerts and streak reminders.",
    granted,
  },
];
