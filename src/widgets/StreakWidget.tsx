import { View, type ViewStyle } from "react-native";
import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
  type TextWidgetStyle,
} from "react-native-android-widget";
import { WidgetCard } from "./primitives/WidgetCard";

interface StreakWidgetProps {
  streak?: number;
  longest?: number;
  size?: "1x1" | "2x1";
}

const DOT_WORKOUT = "#ffd340";
const DOT_REST = "#4a4d55";
const DOT_MISSED = "#f87171";
const DOT_FREEZE = "#fff2c4";

const DayDot = ({
  status,
}: {
  status: "workout" | "rest" | "freeze" | "missed";
}) => {
  const color =
    status === "workout"
      ? DOT_WORKOUT
      : status === "freeze"
        ? DOT_FREEZE
        : status === "rest"
          ? DOT_REST
          : DOT_MISSED;
  return (
    <View
      style={
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginHorizontal: 2,
        } as ViewStyle
      }
    />
  );
};

export const StreakWidget = ({
  streak = 0,
  longest = 0,
  size = "1x1",
}: StreakWidgetProps) =>
  size === "2x1" ? (
    <FlexWidget
      style={
        {
          backgroundColor: "#1a1c20",
          borderRadius: 16,
          padding: 12,
          justifyContent: "flex-start",
        } as FlexWidgetStyle
      }
      clickAction="OPEN_APP"
    >
      <View
        style={
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          } as ViewStyle
        }
      >
        <TextWidget
          text="🔥"
          style={{ fontSize: 24, marginRight: 2 } as TextWidgetStyle}
        />
        <View
          style={
            {
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 4,
            } as ViewStyle
          }
        >
          <TextWidget
            text={String(streak)}
            style={
              {
                fontSize: 28,
                color: "#ffd340",
                fontWeight: "bold",
              } as TextWidgetStyle
            }
          />
          <TextWidget
            text="day streak"
            style={{ fontSize: 10, color: "#a9abb4" } as TextWidgetStyle}
          />
        </View>
      </View>
      <View
        style={
          {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
            paddingHorizontal: 4,
          } as ViewStyle
        }
      >
        {Array.from({ length: 7 }).map(() => (
          <DayDot key="missed" status="missed" />
        ))}
      </View>
      <TextWidget
        text={`Best: ${longest}`}
        style={
          {
            fontSize: 9,
            color: "#7c7f88",
            marginTop: 6,
          } as TextWidgetStyle
        }
      />
    </FlexWidget>
  ) : (
    <FlexWidget
      style={
        {
          backgroundColor: "#1a1c20",
          borderRadius: 16,
          padding: 6,
          justifyContent: "center",
          alignItems: "center",
        } as FlexWidgetStyle
      }
      clickAction="OPEN_APP"
    >
      <WidgetCard style={{ padding: 8 }}>
        <TextWidget text="🔥" style={{ fontSize: 24 } as TextWidgetStyle} />
        <TextWidget
          text={String(streak)}
          style={
            {
              fontSize: 32,
              color: "#ffd340",
              fontWeight: "bold",
            } as TextWidgetStyle
          }
        />
        <TextWidget
          text="day streak"
          style={{ fontSize: 10, color: "#a9abb4" } as TextWidgetStyle}
        />
      </WidgetCard>
    </FlexWidget>
  );
