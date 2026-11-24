import { View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { OnboardingSlide } from "../slides";

interface OnboardingSlideViewProps {
  slide: OnboardingSlide;
  pageWidth: number;
}

export const OnboardingSlideView = ({
  slide,
  pageWidth,
}: OnboardingSlideViewProps) => (
  // A horizontal pager sizes cells from content, so the width is pinned here
  // instead of letting a long heading widen the page and clip the copy.
  <View style={{ width: pageWidth }} className="flex-1 justify-center px-7">
    <View className="mb-6 items-center">
      <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl bg-primary">
        <Icon as={slide.icon} size={38} className="text-primary-foreground" />
      </View>
      <Text className="text-center text-3xl font-black tracking-tight">
        {slide.title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">
        {slide.description}
      </Text>
    </View>

    <View className="gap-4 rounded-3xl border border-border bg-card p-5">
      {slide.features.map((feature) => (
        <View key={feature.title} className="flex-row items-start gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Icon as={feature.icon} size={16} className="text-primary" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold">{feature.title}</Text>
            <Text className="text-xs leading-4 text-muted-foreground">
              {feature.body}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);
