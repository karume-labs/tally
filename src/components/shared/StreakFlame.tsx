import { Flame } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { BRAND_YELLOW } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface StreakFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { icon: 18, text: "text-xl" },
  md: { icon: 24, text: "text-3xl" },
  lg: { icon: 32, text: "text-5xl" },
} as const;

export const StreakFlame = ({ streak, size = "md" }: StreakFlameProps) => {
  const s = SIZES[size];
  return (
    <View className="flex-row items-center gap-1.5">
      <Flame size={s.icon} color={BRAND_YELLOW} fill={BRAND_YELLOW} />
      <Text className={cn("font-extrabold text-foreground", s.text)}>
        {streak}
      </Text>
    </View>
  );
};
