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

export function TodayWorkoutWidget({
  dayName = null,
  exerciseCount = 0,
  exerciseNames = [],
  isRestDay = false,
  sessionActive = false,
  size = "2x2",
}: TodayWorkoutWidgetProps) {
  const content = isRestDay ? (
    <View
      style={
        { alignItems: "center", justifyContent: "center", gap: 4 } as ViewStyle
      }
    >
      <TextWidget text="😴" style={{ fontSize: 32 } as TextWidgetStyle} />
      <TextWidget
        text="Rest Day"
        style={
          { fontSize: 16, color: "#fff", fontWeight: "bold" } as TextWidgetStyle
        }
      />
      <TextWidget
        text="Recover and grow"
        style={{ fontSize: 12, color: "#888" } as TextWidgetStyle}
      />
    </View>
  ) : dayName == null ? (
    <View
      style={
        { alignItems: "center", justifyContent: "center", gap: 4 } as ViewStyle
      }
    >
      <TextWidget text="🏋️" style={{ fontSize: 28 } as TextWidgetStyle} />
      <TextWidget
        text="Set up a split"
        style={
          { fontSize: 14, color: "#fff", fontWeight: "bold" } as TextWidgetStyle
        }
      />
      <TextWidget
        text="Tap to get started"
        style={{ fontSize: 11, color: "#888" } as TextWidgetStyle}
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
          { fontSize: 16, color: "#fff", fontWeight: "bold" } as TextWidgetStyle
        }
      />
      <TextWidget
        text={`${exerciseCount} exercises`}
        style={{ fontSize: 12, color: "#888" } as TextWidgetStyle}
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
        {exerciseNames.slice(0, size === "4x2" ? 3 : 2).map((name, i) => (
          <TextWidget
            key={i}
            text={`• ${name}`}
            style={{ fontSize: 11, color: "#aaa" } as TextWidgetStyle}
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
              backgroundColor: "#ff6b35",
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
                color: "#fff",
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
          backgroundColor: "#1a1a2e",
          borderRadius: 16,
          padding: 6,
          justifyContent: "center",
          alignItems: "center",
          ...(size === "4x2" ? { padding: 8 } : {}),
        } as FlexWidgetStyle
      }
      clickAction="OPEN_APP"
    >
      <WidgetCard style={{ padding: size === "4x2" ? 14 : 10 }}>
        {content}
      </WidgetCard>
    </FlexWidget>
  );
}
