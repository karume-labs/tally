import type { ReactNode } from "react";
import { FlexWidget, type FlexWidgetStyle } from "react-native-android-widget";

interface WidgetCardProps {
  style?: FlexWidgetStyle;
  children: ReactNode;
}

export const WidgetCard = ({ style, children }: WidgetCardProps) => (
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
    clickAction="NONE"
  >
    {children}
  </FlexWidget>
);
