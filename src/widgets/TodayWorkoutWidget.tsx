import { View, type ViewStyle } from "react-native";
import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
  type TextWidgetStyle,
} from "react-native-android-widget";
import type { DayDot } from "@/services/streak";
import { WidgetCard } from "./primitives/WidgetCard";
import { StreakDotRow } from "./StreakDotRow";

export const TODAY_PANELS = 3;

const TEXT = "#f7f5ed";
const MUTED = "#a9abb4";
const ACCENT = "#ffd340";

interface PanelProps {
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

const TodayPanel = ({
  dayName,
  exerciseCount,
  exerciseNames,
  isRestDay,
  sessionActive,
  expanded,
}: PanelProps) => {
  if (isRestDay) {
    return (
      <View style={{ alignItems: "center", gap: 2 } as ViewStyle}>
        <TextWidget
          text="Rest day"
          style={{ fontSize: 18, color: TEXT, fontWeight: "bold" }}
        />
        <TextWidget
          text="Recover and grow"
          style={{ fontSize: 12, color: MUTED }}
        />
      </View>
    );
  }
  if (dayName == null) {
    return (
      <View style={{ alignItems: "center", gap: 2 } as ViewStyle}>
        <TextWidget
          text="No split yet"
          style={{ fontSize: 16, color: TEXT, fontWeight: "bold" }}
        />
        <TextWidget
          text="Tap to pick one"
          style={{ fontSize: 11, color: MUTED }}
        />
      </View>
    );
  }
  return (
    <View style={{ alignItems: "center", gap: 2 } as ViewStyle}>
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
      <View
        style={
          {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
          } as ViewStyle
        }
      >
        {exerciseNames.slice(0, expanded ? 3 : 2).map((name) => (
          <TextWidget
            key={name}
            text={`• ${name}`}
            style={{ fontSize: 11, color: MUTED } as TextWidgetStyle}
          />
        ))}
      </View>
    </View>
  );
};

const TomorrowPanel = ({ tomorrowName }: PanelProps) => (
  <View style={{ alignItems: "center", gap: 3 } as ViewStyle}>
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
  </View>
);

const StreakPanel = ({ streak, dots }: PanelProps) => (
  <View style={{ alignItems: "center", gap: 2 } as ViewStyle}>
    <TextWidget
      text={`${streak} day streak`}
      style={{ fontSize: 17, color: ACCENT, fontWeight: "bold" }}
    />
    <StreakDotRow dots={dots} />
  </View>
);

interface TodayWorkoutWidgetProps extends Omit<PanelProps, "expanded"> {
  panel?: number;
  size?: "2x2" | "4x2";
}

export const TodayWorkoutWidget = ({
  panel = 0,
  size = "2x2",
  ...data
}: TodayWorkoutWidgetProps) => {
  const index = ((panel % TODAY_PANELS) + TODAY_PANELS) % TODAY_PANELS;
  const expanded = size === "4x2";
  const props: PanelProps = { ...data, expanded };

  return (
    <WidgetCard style={{ padding: expanded ? 12 : 8 }} clickAction="OPEN_TODAY">
      <FlexWidget
        style={
          {
            alignItems: "center",
            justifyContent: "center",
          } as FlexWidgetStyle
        }
      >
        {index === 0 ? <TodayPanel {...props} /> : null}
        {index === 1 ? <TomorrowPanel {...props} /> : null}
        {index === 2 ? <StreakPanel {...props} /> : null}
      </FlexWidget>
      <FlexWidget
        style={
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexGap: 10,
            marginTop: 6,
          } as FlexWidgetStyle
        }
      >
        <TextWidget
          text="‹"
          clickAction="TODAY_PREV"
          style={{ fontSize: 20, color: MUTED, padding: 2 }}
        />
        <TextWidget
          text={index === 0 ? "today" : index === 1 ? "tomorrow" : "streak"}
          style={{ fontSize: 9, color: MUTED, letterSpacing: 0.8 }}
        />
        <TextWidget
          text="›"
          clickAction="TODAY_NEXT"
          style={{ fontSize: 20, color: ACCENT, padding: 2 }}
        />
      </FlexWidget>
    </WidgetCard>
  );
};
