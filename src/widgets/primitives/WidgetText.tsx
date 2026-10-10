import { TextWidget, type TextWidgetStyle } from "react-native-android-widget";

interface WidgetTextProps {
  text: string;
  style?: TextWidgetStyle;
}

export function WidgetText({ text, style }: WidgetTextProps) {
  return (
    <TextWidget
      text={text}
      style={{ textAlign: "center", ...style } as TextWidgetStyle}
    />
  );
}
