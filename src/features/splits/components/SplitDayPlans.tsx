import { View } from "react-native";
import { Text } from "@/components/ui/text";
import type { SplitDayPlan } from "../types";

interface SplitDayPlansProps {
  days: SplitDayPlan[];
}

export const SplitDayPlans = ({ days }: SplitDayPlansProps) => (
  <>
    {days.map((day, index) => (
      <View
        key={day.id}
        className={
          index === days.length - 1
            ? "flex-row items-center gap-3 py-2.5"
            : "flex-row items-center gap-3 border-b border-border py-2.5"
        }
      >
        <Text className="w-5 text-xs font-bold text-muted-foreground">
          {index + 1}
        </Text>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold">{day.name}</Text>
          <Text className="text-xs text-muted-foreground">
            {day.isRestDay === true
              ? "Rest day"
              : `${day.exerciseCount} exercise${
                  day.exerciseCount === 1 ? "" : "s"
                }`}
          </Text>
        </View>
      </View>
    ))}
  </>
);
