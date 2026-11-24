import { TextWidget, type TextWidgetStyle } from "react-native-android-widget";

interface WidgetTextProps {
  text: string;
  style?: TextWidgetStyle;
}

export const WidgetText = ({ text, style }: WidgetTextProps) => (
  <TextWidget
    text={text}
    style={{ textAlign: "center", ...style } as TextWidgetStyle}
  />
);
