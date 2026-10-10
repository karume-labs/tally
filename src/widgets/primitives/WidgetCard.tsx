import type { ReactNode } from "react";
import { FlexWidget, type FlexWidgetStyle } from "react-native-android-widget";

interface WidgetCardProps {
  style?: FlexWidgetStyle;
  children: ReactNode;
}

export function WidgetCard({ style, children }: WidgetCardProps) {
  return (
    <FlexWidget
      style={
        {
          backgroundColor: "#1a1a2e",
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
}
