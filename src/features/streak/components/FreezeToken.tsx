import { Snowflake } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { MAX_FREEZES } from "@/lib/constants";
import { BRAND_YELLOW, REST_GRAY } from "@/lib/theme";
import { useStreakStore } from "@/stores/use-streak-store";

const SLOTS = Array.from({ length: MAX_FREEZES }, (_, i) => i);

export const FreezeToken = () => {
  const row = useStreakStore((s) => s.row);
  const available = row?.freezesAvailable ?? 0;
  const used = row?.freezesUsed ?? 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        {SLOTS.map((slot) => {
          const filled = slot < available;
          return (
            <View
              key={slot}
              className={
                filled
                  ? "h-9 w-9 items-center justify-center rounded-full bg-primary/20"
                  : "h-9 w-9 items-center justify-center rounded-full bg-secondary"
              }
            >
              <Snowflake size={16} color={filled ? BRAND_YELLOW : REST_GRAY} />
            </View>
          );
        })}
      </View>
      <Text className="text-xs text-muted-foreground">
        {available} available · {used} used
      </Text>
    </View>
  );
};
