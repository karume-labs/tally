import {
  FlexWidget,
  type FlexWidgetStyle,
  TextWidget,
} from "react-native-android-widget";
import { WidgetCard } from "./primitives/WidgetCard";
import {
  type PanelProps,
  StreakPanel,
  TodayPanel,
  TomorrowPanel,
} from "./TodayPanels";

export const TODAY_PANELS = 3;

const MUTED = "#a9abb4";
const ACCENT = "#ffd340";

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

  // The today panel is the shortcut that matters: it opens the workout screen
  // directly so a session starts without a trip through the Today tab. Rest
  // and split-less days have nothing to start, so they keep the tab route.
  const canStartNow = index === 0 && data.dayName != null && !data.isRestDay;
  const cardAction =
    index === 2 ? "OPEN_STREAK" : canStartNow ? "OPEN_WORKOUT" : "OPEN_TODAY";

  return (
    <WidgetCard style={{ padding: expanded ? 12 : 8 }} clickAction={cardAction}>
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
