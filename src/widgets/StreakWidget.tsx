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

const DOT_WORKOUT = "#22c55e";
const DOT_REST = "#6b7280";
const DOT_MISSED = "#ef4444";
const DOT_FREEZE = "#f59e0b";

function DayDot({
  status,
}: {
  status: "workout" | "rest" | "freeze" | "missed";
}) {
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
}

export function StreakWidget({
  streak = 0,
  longest = 0,
  size = "1x1",
}: StreakWidgetProps) {
  if (size === "2x1") {
    return (
      <FlexWidget
        style={
          {
            backgroundColor: "#1a1a2e",
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
                  color: "#ff6b35",
                  fontWeight: "bold",
                } as TextWidgetStyle
              }
            />
            <TextWidget
              text="day streak"
              style={{ fontSize: 10, color: "#888" } as TextWidgetStyle}
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
          {Array.from({ length: 7 }).map((_, i) => (
            <DayDot key={i} status="missed" />
          ))}
        </View>
        <TextWidget
          text={`Best: ${longest}`}
          style={
            { fontSize: 9, color: "#666", marginTop: 6 } as TextWidgetStyle
          }
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={
        {
          backgroundColor: "#1a1a2e",
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
              color: "#ff6b35",
              fontWeight: "bold",
            } as TextWidgetStyle
          }
        />
        <TextWidget
          text="day streak"
          style={{ fontSize: 10, color: "#888" } as TextWidgetStyle}
        />
      </WidgetCard>
    </FlexWidget>
  );
}
