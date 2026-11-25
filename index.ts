import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import App from "./src/app/_layout";

registerRootComponent(App);

// Registering here (the Android entry point) rather than from the React tree
// means a widget update that launches the app headlessly still finds the
// handler, even though no screen has mounted.
if (Platform.OS === "android") {
  try {
    const widgetMod = require("react-native-android-widget");
    const { WidgetTaskHandler } = require("./src/widgets/widget-task-handler");
    widgetMod?.registerWidgetTaskHandler?.(WidgetTaskHandler);
  } catch (err) {
    console.warn("[tally.widget] task handler registration failed:", err);
  }
}
