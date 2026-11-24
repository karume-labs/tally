import { View } from "react-native";
import { Text } from "@/components/ui/text";
import type { TodayExercise } from "@/db/today";
import { cn } from "@/lib/utils";
import { groupBySuperset } from "../services/superset-groups";

interface ExerciseGroupListProps {
  exercises: TodayExercise[];
}

export const ExerciseGroupList = ({ exercises }: ExerciseGroupListProps) => (
  <View className="gap-3">
    {groupBySuperset(exercises).map((group, groupIndex) => {
      const isSuperset = group.label != null;
      return (
        <View
          key={group.key}
          className="overflow-hidden rounded-2xl border border-border bg-background"
        >
          {isSuperset && (
            <View className="flex-row items-center justify-between bg-primary/10 px-4 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                {group.label}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {group.exercises[0].targetSets ?? 0} rounds
              </Text>
            </View>
          )}
          {group.exercises.map((exercise, index) => (
            <View
              key={exercise.id}
              className={cn(
                "flex-row items-center gap-3 px-4 py-3",
                index < group.exercises.length - 1 && "border-b border-border",
              )}
            >
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Text className="text-xs font-black text-primary">
                  {isSuperset
                    ? String.fromCharCode(65 + index)
                    : groupIndex + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold">{exercise.name}</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  {exercise.targetSets != null && exercise.targetReps != null
                    ? `${exercise.targetSets} × ${exercise.targetReps}`
                    : "No target"}
                  {exercise.restSeconds > 0
                    ? ` · ${exercise.restSeconds}s rest`
                    : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    })}
  </View>
);
