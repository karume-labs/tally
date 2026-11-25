import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { weekSchedule } from "@/features/splits/services/weekly-plan";
import type { SplitDayPlan } from "@/features/splits/types";

interface WeekScheduleProps {
  schedule: string;
  days: SplitDayPlan[];
}

export const WeekSchedule = ({ schedule, days }: WeekScheduleProps) => {
  const week = weekSchedule(schedule);
  if (week.length === 0) return null;

  return (
    <SectionCard title="Week">
      {week.map(({ weekday, dayName }, index) => {
        const plan = days.find((day) => day.name === dayName);
        const isRest =
          plan != null ? plan.isRestDay === true : dayName === "Rest";
        const last = index === week.length - 1;
        return (
          <View
            key={weekday}
            className={
              last
                ? "flex-row items-center gap-3 py-2"
                : "flex-row items-center gap-3 border-b border-border py-2"
            }
          >
            <Text className="w-10 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {weekday}
            </Text>
            <Text className="flex-1 text-sm font-semibold">{dayName}</Text>
            <Text className="text-xs text-muted-foreground">
              {isRest
                ? "Off"
                : plan != null
                  ? `${plan.exerciseCount} exercises`
                  : "—"}
            </Text>
          </View>
        );
      })}
    </SectionCard>
  );
};
