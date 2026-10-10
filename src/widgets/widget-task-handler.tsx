import type React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { StreakWidget } from "./StreakWidget";
import { TodayWorkoutWidget } from "./TodayWorkoutWidget";
import { WidgetCard } from "./primitives/WidgetCard";
import { TextWidget } from "react-native-android-widget";
import {
  readStreakWidgetData,
  readTodayWidgetData,
  readLast7Dots,
} from "../services/widgetSync";

type WidgetName = "Streak" | "TodayWorkout";

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

export function WidgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName as WidgetName | undefined;
  const Widget = widgetName ? widgetComponents[widgetName] : undefined;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      if (!Widget) {
        // Unknown widget name — render nothing.
        return null;
      }

      if (widgetName === "Streak") {
        const streakData = readStreakWidgetData();
        const _dots = readLast7Dots();
        const size = props.widgetInfo.width > props.widgetInfo.height ? "2x1" : "1x1";
        props.renderWidget(
          <StreakWidget
            size={size}
            streak={streakData?.current ?? 0}
            longest={streakData?.longest ?? 0}
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
    }
    case "WIDGET_CLICK": {
      // The widget's clickAction="OPEN_APP" (configured on the FlexWidget) opens
      // the app. Additional in-widget actions (e.g. a "Start" button) are not
      // yet supported; forward a no-op so the handler still returns a view.
      break;
    }
  }

  return (
    <WidgetCard style={{ padding: 8 }}>
      <TextWidget text="Tally" style={{ fontSize: 12, color: "#888" }} />
    </WidgetCard>
  );
}
