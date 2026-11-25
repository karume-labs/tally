import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import notifee from "react-native-notify-kit";
import App from "./src/app/_layout";

registerRootComponent(App);

// Registering here (the Android entry point) rather than from the React tree
// means a widget update that launches the app headlessly still finds the
// handler, even though no screen has mounted.
if (Platform.OS === "android") {
  // Must be registered before the app tree mounts: an action press can launch
  // this process headlessly, and notifee looks for the handler at that point.
  const {
    handleLiveWorkoutEvent,
  } = require("./src/services/live-workout-actions");
  notifee.onBackgroundEvent(async (event) => {
    handleLiveWorkoutEvent(event);
  });

  try {
    const widgetMod = require("react-native-android-widget");
    const { WidgetTaskHandler } = require("./src/widgets/widget-task-handler");
    widgetMod?.registerWidgetTaskHandler?.(WidgetTaskHandler);
  } catch (err) {
    console.warn("[tally.widget] task handler registration failed:", err);
  }
}
