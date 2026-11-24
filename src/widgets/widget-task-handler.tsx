import type React from "react";
import { Linking } from "react-native";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TextWidget } from "react-native-android-widget";
import {
  readLast7Dots,
  readStreakWidgetData,
  readTodayWidgetData,
} from "../services/widgetSync";
import { WidgetCard } from "./primitives/WidgetCard";
import { StreakWidget } from "./StreakWidget";
import { TodayWorkoutWidget } from "./TodayWorkoutWidget";

type WidgetName = "Streak" | "TodayWorkout";

// Custom actions (not OPEN_APP/OPEN_URI) reach this handler, which deep-links
// into the app so the tap lands on the screen the widget is about.
const CLICK_ROUTES: Record<string, string> = {
  OPEN_STREAK: "tally:///streak",
  OPEN_TODAY: "tally:///today",
};

const widgetComponents: Record<WidgetName, React.ComponentType<object>> = {
  Streak: ({ style }: { style?: object }) => (
    <WidgetCard style={style as object}>
      <StreakWidget size="1x1" />
    </WidgetCard>
  ),
  TodayWorkout: ({ style }: { style?: object }) => (
    <WidgetCard style={style as object}>
      <TodayWorkoutWidget size="2x2" />
    </WidgetCard>
  ),
};

export const WidgetTaskHandler = (props: WidgetTaskHandlerProps) => {
  const widgetName = props.widgetInfo.widgetName as WidgetName | undefined;
  const Widget = widgetName ? widgetComponents[widgetName] : undefined;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      if (!Widget) {
        // Unknown widget name — render nothing.
        break;
      }

      if (widgetName === "Streak") {
        const streakData = readStreakWidgetData();
        const dots = readLast7Dots();
        const size =
          props.widgetInfo.width > props.widgetInfo.height ? "2x1" : "1x1";
        props.renderWidget(
          <StreakWidget
            size={size}
            streak={streakData?.current ?? 0}
            longest={streakData?.longest ?? 0}
            dots={dots}
          />,
        );
      } else if (widgetName === "TodayWorkout") {
        const todayData = readTodayWidgetData();
        const width = props.widgetInfo.width;
        const _height = props.widgetInfo.height;
        const size = width >= 4 ? "4x2" : "2x2";
        props.renderWidget(
          <TodayWorkoutWidget
            size={size}
            sessionActive={todayData?.sessionActive ?? false}
            dayName={todayData?.dayName ?? null}
            exerciseCount={todayData?.exerciseCount ?? 0}
            exerciseNames={todayData?.exerciseNames ?? []}
            isRestDay={todayData?.isRestDay ?? false}
          />,
        );
      }
      break;
    }
    case "WIDGET_CLICK": {
      const route = props.clickAction
        ? CLICK_ROUTES[props.clickAction]
        : undefined;
      if (route) {
        Linking.openURL(route).catch((err: unknown) => {
          console.warn("[tally.widget] deep link failed:", err);
        });
      }
      break;
    }
  }

  return (
    <WidgetCard style={{ padding: 8 }}>
      <TextWidget text="Tally" style={{ fontSize: 12, color: "#888" }} />
    </WidgetCard>
  );
};
