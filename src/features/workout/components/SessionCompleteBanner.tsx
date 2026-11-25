import { View } from "react-native";
import { Text } from "@/components/ui/text";

/** Hands-free mode ends on its own, so the finish button needs a nudge here. */
export const SessionCompleteBanner = () => (
  <View className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
    <Text className="text-sm font-semibold text-primary">
      Every set is logged. Finish when you're ready.
    </Text>
  </View>
);
