import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import {
  renderStreakWidget,
  renderTodayWidget,
} from "@/widgets/render-widgets";

const refreshAll = async () => {
  await requestWidgetUpdate({
    widgetName: "Streak",
    renderWidget: renderStreakWidget,
  });
  await requestWidgetUpdate({
    widgetName: "TodayWorkout",
    renderWidget: renderTodayWidget,
  });
};

/** Pushes fresh MMKV payloads into any widget placed on the home screen. */
export const refreshWidgets = () => {
  if (Platform.OS !== "android") return;
  refreshAll().catch((err: unknown) => {
    // No widget placed is not an error worth surfacing.
    console.warn("[tally.widget] refresh skipped:", err);
  });
};
