// Bundle entry (package.json "main"). expo-router's entry mounts the app, but a
// widget update or a notification action can start this bundle with no UI, so
// both native handlers must be registered here, before React mounts. Registering
// them from a component or from an unused index.ts left the widget task missing
// ("No task registered for key RNWidgetBackgroundTask") and the widget blank.
import "expo-router/entry";
import { Platform } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import notifee from "react-native-notify-kit";
import { handleLiveWorkoutEvent } from "./src/services/live-workout-actions";
import { WidgetTaskHandler } from "./src/widgets/widget-task-handler";

if (Platform.OS === "android") {
  registerWidgetTaskHandler(WidgetTaskHandler);
  notifee.onBackgroundEvent(async (event) => {
    await handleLiveWorkoutEvent(event);
  });
}
