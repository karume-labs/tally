import { FlexWidget, type FlexWidgetStyle } from "react-native-android-widget";
import type { DayDot } from "@/services/streak";

const DOT_COLORS: Record<DayDot["status"], string> = {
  workout: "#ffd340",
  rest: "#4a4d55",
  freeze: "#fff2c4",
  missed: "#f87171",
};

const WEEK_LENGTH = 7;

const placeholderDots = (count: number): DayDot[] =>
  Array.from({ length: count }, (_, index) => ({
    dayKey: `placeholder-${index}`,
    status: "rest" as const,
  }));

interface StreakDotRowProps {
  dots: DayDot[];
}

export const StreakDotRow = ({ dots }: StreakDotRowProps) => {
  const week = dots.slice(-WEEK_LENGTH);
  const padded =
    week.length === WEEK_LENGTH
      ? week
      : [...placeholderDots(WEEK_LENGTH - week.length), ...week];

  return (
    <FlexWidget
      style={
        {
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
          paddingHorizontal: 4,
        } as FlexWidgetStyle
      }
    >
      {padded.map((dot) => (
        <FlexWidget
          key={dot.dayKey}
          style={
            {
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: DOT_COLORS[dot.status],
              marginHorizontal: 2,
            } as FlexWidgetStyle
          }
        />
      ))}
    </FlexWidget>
  );
};
