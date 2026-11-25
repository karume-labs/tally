import type { ReactNode } from "react";
import { FlexWidget, type FlexWidgetStyle } from "react-native-android-widget";

interface WidgetCardProps {
  style?: FlexWidgetStyle;
  children: ReactNode;
  /** Tap target for the whole card; omit on cards that are purely layout. */
  clickAction?: string;
}

export const WidgetCard = ({
  style,
  children,
  clickAction = "NONE",
}: WidgetCardProps) => (
  <FlexWidget
    style={
      {
        backgroundColor: "#1a1c20",
        borderRadius: 16,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        ...style,
      } as FlexWidgetStyle
    }
    clickAction={clickAction}
  >
    {children}
  </FlexWidget>
);
