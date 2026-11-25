import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Sheet } from "@/components/shared/Sheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { loadExercisesForSplitDay } from "@/db/split-days";
import type { TodayExercise } from "@/db/today";
import { ExerciseGroupList } from "@/features/workout/components/ExerciseGroupList";
import type { SplitDayPlan } from "../types";

interface SplitDayPlansProps {
  days: SplitDayPlan[];
}

/** Day rows open a swipe-up sheet with the day's real exercise list. */
export const SplitDayPlans = ({ days }: SplitDayPlansProps) => {
  const [selected, setSelected] = useState<SplitDayPlan | null>(null);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);

  const openDay = async (day: SplitDayPlan) => {
    if (day.isRestDay === true) return;
    setSelected(day);
    setExercises(await loadExercisesForSplitDay(day.id));
  };

  return (
    <>
      {days.map((day, index) => (
        <Pressable
          key={day.id}
          accessibilityRole="button"
          onPress={() => openDay(day)}
          className={
            index === days.length - 1
              ? "flex-row items-center gap-3 py-2.5 active:opacity-70"
              : "flex-row items-center gap-3 border-b border-border py-2.5 active:opacity-70"
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
          {day.isRestDay !== true && (
            <Icon
              as={ChevronRight}
              className="text-muted-foreground"
              size={16}
            />
          )}
        </Pressable>
      ))}

      <Sheet
        visible={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Day"}
        subtitle={`${exercises.length} exercise${exercises.length === 1 ? "" : "s"}`}
      >
        <View className="mt-4">
          {exercises.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              This day has no exercises yet.
            </Text>
          ) : (
            <ExerciseGroupList exercises={exercises} />
          )}
        </View>
      </Sheet>
    </>
  );
};
