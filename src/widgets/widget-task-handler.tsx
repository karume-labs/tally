import { Linking, Platform } from "react-native";
import {
  requestWidgetUpdate,
  type WidgetTaskHandlerProps,
} from "react-native-android-widget";
import { stepTodayPanel } from "@/services/widget-panel";
import { renderStreakWidget, renderTodayWidget } from "./render-widgets";

type WidgetName = "Streak" | "TodayWorkout";

// Custom actions (not OPEN_APP/OPEN_URI) reach this handler, which deep-links
// into the app so the tap lands on the screen the widget is about.
const CLICK_ROUTES: Record<string, string> = {
  OPEN_STREAK: "tally:///streak",
  OPEN_TODAY: "tally:///today",
};

const refreshToday = async () => {
  await requestWidgetUpdate({
    widgetName: "TodayWorkout",
    renderWidget: renderTodayWidget,
  });
};

export const WidgetTaskHandler = (props: WidgetTaskHandlerProps) => {
  const widgetName = props.widgetInfo.widgetName as WidgetName | undefined;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      if (widgetName === "Streak") {
        props.renderWidget(renderStreakWidget(props.widgetInfo));
      } else if (widgetName === "TodayWorkout") {
        props.renderWidget(renderTodayWidget(props.widgetInfo));
      }
      break;
    }
    case "WIDGET_CLICK": {
      const action = props.clickAction;
      if (action === "TODAY_NEXT" || action === "TODAY_PREV") {
        stepTodayPanel(action === "TODAY_NEXT" ? 1 : -1);
        refreshToday().catch((err: unknown) => {
          console.warn("[tally.widget] panel refresh failed:", err);
        });
        break;
      }
      const route = action ? CLICK_ROUTES[action] : undefined;
      if (route && Platform.OS !== "web") {
        Linking.openURL(route).catch((err: unknown) => {
          console.warn("[tally.widget] deep link failed:", err);
        });
      }
      break;
    }
  }
};
