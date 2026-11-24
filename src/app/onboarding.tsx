import { useRouter } from "expo-router";
import { Play } from "lucide-react-native";
import { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";
import { OnboardingSlideView } from "@/features/onboarding/components/OnboardingSlideView";
import { PaginatorDot } from "@/features/onboarding/components/PaginatorDot";
import {
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from "@/features/onboarding/slides";
import { useSettingsStore } from "@/stores/use-settings-store";

const { width: PAGE_WIDTH } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSettings = useSettingsStore((s) => s.setSettings);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  // Persisted before navigating: if the app dies on the way into the tabs, the
  // next launch should not start onboarding again.
  const dismiss = () => {
    setSettings({ onboarded: true });
    router.replace("/");
  };

  const next = () => {
    if (isLast) {
      dismiss();
      return;
    }
    const target = index + 1;
    listRef.current?.scrollToOffset({
      offset: target * PAGE_WIDTH,
      animated: true,
    });
    setIndex(target);
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row justify-end px-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        {!isLast && (
          <Pressable
            accessibilityRole="button"
            onPress={dismiss}
            className="px-2 py-2 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-muted-foreground">
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(slide) => slide.id}
        renderItem={({ item }) => (
          <OnboardingSlideView slide={item} pageWidth={PAGE_WIDTH} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH))
        }
        getItemLayout={(_, itemIndex) => ({
          length: PAGE_WIDTH,
          offset: PAGE_WIDTH * itemIndex,
          index: itemIndex,
        })}
      />

      <View
        className="gap-5 px-6"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="flex-row items-center justify-center gap-2">
          {ONBOARDING_SLIDES.map((slide, dotIndex) => (
            <PaginatorDot key={slide.id} active={dotIndex === index} />
          ))}
        </View>
        <ActionButton
          size="lg"
          label={isLast ? "Start training" : "Next"}
          icon={isLast ? Play : undefined}
          onPress={next}
        />
      </View>
    </View>
  );
}
