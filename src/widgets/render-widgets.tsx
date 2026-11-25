import type { WidgetInfo } from "react-native-android-widget";
import { readTodayPanel } from "@/services/widget-panel";
import {
  readLast7Dots,
  readStreakWidgetData,
  readTodayWidgetData,
} from "@/services/widgetSync";
import { StreakWidget } from "./StreakWidget";
import { TodayWorkoutWidget } from "./TodayWorkoutWidget";

type SizeInfo = Pick<WidgetInfo, "width" | "height">;

export const renderStreakWidget = (info: SizeInfo) => {
  const data = readStreakWidgetData();
  return (
    <StreakWidget
      size={info.width > info.height ? "2x1" : "1x1"}
      streak={data?.current ?? 0}
      longest={data?.longest ?? 0}
      dots={readLast7Dots()}
    />
  );
};

export const renderTodayWidget = (info: SizeInfo) => {
  const data = readTodayWidgetData();
  return (
    <TodayWorkoutWidget
      size={info.width >= 4 ? "4x2" : "2x2"}
      panel={readTodayPanel()}
      sessionActive={data?.sessionActive ?? false}
      dayName={data?.dayName ?? null}
      exerciseCount={data?.exerciseCount ?? 0}
      exerciseNames={data?.exerciseNames ?? []}
      isRestDay={data?.isRestDay ?? false}
      tomorrowName={data?.tomorrowDayName ?? null}
      streak={readStreakWidgetData()?.current ?? 0}
      dots={readLast7Dots()}
    />
  );
};
