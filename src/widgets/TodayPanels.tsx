import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
  type TextWidgetStyle,
} from "react-native-android-widget";
import type { DayDot } from "@/services/streak";
import { StreakDotRow } from "./StreakDotRow";

const TEXT = "#f7f5ed";
const MUTED = "#a9abb4";
const ACCENT = "#ffd340";

// Widgets render in a headless task with no React tree above them, so every
// layout node must be a FlexWidget: react-native-android-widget only converts
// its own components into RemoteViews, and a plain react-native View pulls in
// uniwind's className patching, which has no context there and throws.
export interface PanelProps {
  dayName: string | null;
  tomorrowName: string | null;
  exerciseCount: number;
  exerciseNames: string[];
  isRestDay: boolean;
  sessionActive: boolean;
  streak: number;
  dots: DayDot[];
  expanded: boolean;
}

export const TodayPanel = ({
  dayName,
  exerciseCount,
  exerciseNames,
  isRestDay,
  sessionActive,
  expanded,
}: PanelProps) => {
  if (isRestDay) {
    return (
      <FlexWidget
        style={{ alignItems: "center", flexGap: 2 } as FlexWidgetStyle}
      >
        <TextWidget
          text="Rest day"
          style={{ fontSize: 18, color: TEXT, fontWeight: "bold" }}
        />
        <TextWidget
          text="Recover and grow"
          style={{ fontSize: 12, color: MUTED }}
        />
      </FlexWidget>
    );
  }
  if (dayName == null) {
    return (
      <FlexWidget
        style={{ alignItems: "center", flexGap: 2 } as FlexWidgetStyle}
      >
        <TextWidget
          text="No split yet"
          style={{ fontSize: 16, color: TEXT, fontWeight: "bold" }}
        />
        <TextWidget
          text="Tap to pick one"
          style={{ fontSize: 11, color: MUTED }}
        />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget style={{ alignItems: "center", flexGap: 2 } as FlexWidgetStyle}>
      <TextWidget
        text={dayName}
        style={{ fontSize: 17, color: TEXT, fontWeight: "bold" }}
      />
      <TextWidget
        text={
          sessionActive ? "Session in progress" : `${exerciseCount} exercises`
        }
        style={{ fontSize: 12, color: sessionActive ? "#c9db74" : MUTED }}
      />
      <FlexWidget
        style={
          {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            flexGap: 2,
          } as FlexWidgetStyle
        }
      >
        {exerciseNames.slice(0, expanded ? 2 : 1).map((name) => (
          <TextWidget
            key={name}
            text={`• ${name}`}
            style={{ fontSize: 11, color: MUTED } as TextWidgetStyle}
          />
        ))}
      </FlexWidget>
      {!sessionActive && (
        <TextWidget
          text="TAP TO START"
          style={{
            fontSize: 9,
            color: ACCENT,
            fontWeight: "bold",
            letterSpacing: 1,
          }}
        />
      )}
    </FlexWidget>
  );
};

export const TomorrowPanel = ({ tomorrowName }: PanelProps) => (
  <FlexWidget style={{ alignItems: "center", flexGap: 3 } as FlexWidgetStyle}>
    <TextWidget
      text="TOMORROW"
      style={{
        fontSize: 9,
        color: MUTED,
        fontWeight: "bold",
        letterSpacing: 1.4,
      }}
    />
    <TextWidget
      text={tomorrowName ?? "Nothing scheduled"}
      style={{ fontSize: 16, color: TEXT, fontWeight: "bold" }}
    />
    <TextWidget
      text={tomorrowName == null ? "Pick a split" : "Be ready for it"}
      style={{ fontSize: 11, color: MUTED }}
    />
  </FlexWidget>
);

export const StreakPanel = ({ streak, dots }: PanelProps) => (
  <FlexWidget style={{ alignItems: "center", flexGap: 2 } as FlexWidgetStyle}>
    <TextWidget
      text={`${streak} day streak`}
      style={{ fontSize: 17, color: ACCENT, fontWeight: "bold" }}
    />
    <StreakDotRow dots={dots} />
  </FlexWidget>
);
