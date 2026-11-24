import { View, type ViewStyle } from "react-native";
import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
  type TextWidgetStyle,
} from "react-native-android-widget";
import { WidgetCard } from "./primitives/WidgetCard";

interface TodayWorkoutWidgetProps {
  dayName?: string | null;
  exerciseCount?: number;
  exerciseNames?: string[];
  isRestDay?: boolean;
  sessionActive?: boolean;
  size?: "2x2" | "4x2";
}

export const TodayWorkoutWidget = ({
  dayName = null,
  exerciseCount = 0,
  exerciseNames = [],
  isRestDay = false,
  sessionActive = false,
  size = "2x2",
}: TodayWorkoutWidgetProps) => {
  const inner = isRestDay ? (
    <View
      style={
        {
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        } as ViewStyle
      }
    >
      <TextWidget text="😴" style={{ fontSize: 32 } as TextWidgetStyle} />
      <TextWidget
        text="Rest Day"
        style={
          {
            fontSize: 16,
            color: "#f7f5ed",
            fontWeight: "bold",
          } as TextWidgetStyle
        }
      />
      <TextWidget
        text="Recover and grow"
        style={{ fontSize: 12, color: "#a9abb4" } as TextWidgetStyle}
      />
    </View>
  ) : dayName == null ? (
    <View
      style={
        {
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        } as ViewStyle
      }
    >
      <TextWidget text="🏋️" style={{ fontSize: 28 } as TextWidgetStyle} />
      <TextWidget
        text="Set up a split"
        style={
          {
            fontSize: 14,
            color: "#f7f5ed",
            fontWeight: "bold",
          } as TextWidgetStyle
        }
      />
      <TextWidget
        text="Tap to get started"
        style={{ fontSize: 11, color: "#a9abb4" } as TextWidgetStyle}
      />
    </View>
  ) : (
    <View
      style={
        {
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
          paddingVertical: 4,
        } as ViewStyle
      }
    >
      <TextWidget
        text={dayName}
        style={
          {
            fontSize: 16,
            color: "#f7f5ed",
            fontWeight: "bold",
          } as TextWidgetStyle
        }
      />
      <TextWidget
        text={
          sessionActive ? "Session in progress" : `${exerciseCount} exercises`
        }
        style={
          {
            fontSize: 12,
            color: sessionActive ? "#c9db74" : "#a9abb4",
          } as TextWidgetStyle
        }
      />
      <View
        style={
          {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
            marginTop: 2,
          } as ViewStyle
        }
      >
        {exerciseNames.slice(0, size === "4x2" ? 3 : 2).map((name) => (
          <TextWidget
            key={name}
            text={`• ${name}`}
            style={{ fontSize: 11, color: "#a9abb4" } as TextWidgetStyle}
          />
        ))}
      </View>
      {size === "4x2" && (
        <View
          style={
            {
              marginTop: 6,
              paddingHorizontal: 12,
              paddingVertical: 4,
              backgroundColor: "#ffd340",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              width: 80,
            } as ViewStyle
          }
        >
          <TextWidget
            text="▶ Start"
            style={
              {
                fontSize: 13,
                color: "#141414",
                fontWeight: "bold",
              } as TextWidgetStyle
            }
          />
        </View>
      )}
    </View>
  );

  return (
    <FlexWidget
      style={
        {
          backgroundColor: "#1a1c20",
          borderRadius: 16,
          padding: 6,
          justifyContent: "center",
          alignItems: "center",
          ...(size === "4x2" ? { padding: 8 } : {}),
        } as FlexWidgetStyle
      }
      clickAction="OPEN_TODAY"
    >
      <WidgetCard style={{ padding: size === "4x2" ? 14 : 10 }}>
        {inner}
      </WidgetCard>
    </FlexWidget>
  );
};
