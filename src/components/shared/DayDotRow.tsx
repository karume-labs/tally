import { Check, Snowflake } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { BRAND_INK, BRAND_YELLOW } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { DayDot } from "@/services/streak";

const STATUS_CLASS: Record<DayDot["status"], string> = {
  workout: "border border-primary bg-primary",
  rest: "border border-border bg-secondary",
  freeze: "border border-primary/40 bg-primary/15",
  // Empty days sit on the card, so they need an outline rather than a fill
  // that matches the card colour.
  missed: "border border-border bg-transparent",
};

interface DayDotRowProps {
  dots: DayDot[];
}

export const DayDotRow = ({ dots }: DayDotRowProps) => (
  <View className="flex-row gap-1.5">
    {dots.map((dot) => {
      // Noon avoids a timezone shift moving the label onto the neighbouring day.
      const date = new Date(`${dot.dayKey}T12:00:00`);
      const label = date.toLocaleDateString(undefined, { weekday: "narrow" });
      return (
        <View key={dot.dayKey} className="flex-1 items-center gap-2">
          <View
            className={cn(
              "h-12 w-full items-center justify-center rounded-xl",
              STATUS_CLASS[dot.status],
            )}
          >
            {dot.status === "workout" && (
              <Check size={16} color={BRAND_INK} strokeWidth={3.5} />
            )}
            {dot.status === "freeze" && (
              <Snowflake size={15} color={BRAND_YELLOW} />
            )}
            {dot.status === "rest" && (
              <View className="h-0.5 w-3 rounded-full bg-muted-foreground/60" />
            )}
          </View>
          <Text className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {label}
          </Text>
        </View>
      );
    })}
  </View>
);
