import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
  type TextWidgetStyle,
} from "react-native-android-widget";
import type { DayDot } from "@/services/streak";
import { WidgetCard } from "./primitives/WidgetCard";
import { StreakDotRow } from "./StreakDotRow";

interface StreakWidgetProps {
  streak?: number;
  longest?: number;
  dots?: DayDot[];
  size?: "1x1" | "2x1";
}

export const StreakWidget = ({
  streak = 0,
  longest = 0,
  dots = [],
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
      clickAction="OPEN_STREAK"
    >
      <FlexWidget
        style={
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexGap: 6,
          } as FlexWidgetStyle
        }
      >
        <TextWidget
          text="STREAK"
          style={
            {
              fontSize: 9,
              color: "#7c7f88",
              fontWeight: "bold",
              letterSpacing: 1.2,
              marginRight: 2,
            } as TextWidgetStyle
          }
        />
        <FlexWidget
          style={
            {
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              flexGap: 4,
            } as FlexWidgetStyle
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
        </FlexWidget>
      </FlexWidget>
      <StreakDotRow dots={dots} />
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
      clickAction="OPEN_STREAK"
    >
      <WidgetCard style={{ padding: 8 }} clickAction="OPEN_STREAK">
        <TextWidget
          text="STREAK"
          style={
            {
              fontSize: 9,
              color: "#7c7f88",
              fontWeight: "bold",
              letterSpacing: 1,
            } as TextWidgetStyle
          }
        />
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
