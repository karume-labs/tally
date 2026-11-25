import { View, type ViewStyle } from "react-native";
import { TextWidget, type TextWidgetStyle } from "react-native-android-widget";
import type { DayDot } from "@/services/streak";
import { StreakDotRow } from "./StreakDotRow";

const TEXT = "#f7f5ed";
const MUTED = "#a9abb4";
const ACCENT = "#ffd340";

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
        {exerciseNames.slice(0, expanded ? 2 : 1).map((name) => (
          <TextWidget
            key={name}
            text={`• ${name}`}
            style={{ fontSize: 11, color: MUTED } as TextWidgetStyle}
          />
        ))}
      </View>
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
    </View>
  );
};

export const TomorrowPanel = ({ tomorrowName }: PanelProps) => (
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

export const StreakPanel = ({ streak, dots }: PanelProps) => (
  <View style={{ alignItems: "center", gap: 2 } as ViewStyle}>
    <TextWidget
      text={`${streak} day streak`}
      style={{ fontSize: 17, color: ACCENT, fontWeight: "bold" }}
    />
    <StreakDotRow dots={dots} />
  </View>
);
