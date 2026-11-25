import { Plus, Trash2, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useUniwind } from "uniwind";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { LibraryExercise } from "@/features/exercises/types";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { DraftDay } from "../types";
import { ExercisePickerSheet } from "./ExercisePickerSheet";

interface SplitDayEditorProps {
  day: DraftDay;
  index: number;
  defaultRestSeconds: number;
  onChange: (day: DraftDay) => void;
  onRemove: () => void;
}

export const SplitDayEditor = ({
  day,
  index,
  defaultRestSeconds,
  onChange,
  onRemove,
}: SplitDayEditorProps) => {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const [picking, setPicking] = useState(false);

  const addExercise = (exercise: LibraryExercise) => {
    if (day.exercises.some((row) => row.exerciseId === exercise.id)) return;
    onChange({
      ...day,
      exercises: [
        ...day.exercises,
        {
          exerciseId: exercise.id,
          name: exercise.name,
          targetSets: 3,
          targetReps: "8-12",
          restSeconds: defaultRestSeconds,
          supersetGroup: null,
        },
      ],
    });
  };

  const removeExercise = (exerciseId: string) =>
    onChange({
      ...day,
      exercises: day.exercises.filter((row) => row.exerciseId !== exerciseId),
    });

  return (
    <View className="gap-2 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-2">
        <Text className="w-5 text-xs font-bold text-muted-foreground">
          {index + 1}
        </Text>
        <TextInput
          className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground"
          value={day.name}
          onChangeText={(name) => onChange({ ...day, name })}
          placeholder="Day name, e.g. Push"
          placeholderTextColor={colors.mutedForeground}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${day.name}`}
          onPress={onRemove}
          className="p-1.5 active:opacity-70"
        >
          <Icon as={Trash2} className="text-muted-foreground" size={16} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: day.isRestDay }}
        accessibilityLabel={`${day.name} is a rest day`}
        onPress={() => onChange({ ...day, isRestDay: !day.isRestDay })}
        className={cn(
          "flex-row items-center justify-between rounded-xl border px-3 py-2 active:opacity-70",
          day.isRestDay ? "border-primary/40 bg-primary/10" : "border-border",
        )}
      >
        <Text className="text-xs font-semibold">Rest day</Text>
        <Text
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            day.isRestDay ? "text-primary" : "text-muted-foreground",
          )}
        >
          {day.isRestDay ? "On" : "Off"}
        </Text>
      </Pressable>

      {day.isRestDay ? (
        <Text className="text-xs text-muted-foreground">
          Recovery day: nothing is scheduled and no session starts on it.
        </Text>
      ) : (
        <>
          {day.exercises.map((exercise) => (
            <View
              key={exercise.exerciseId}
              className="flex-row items-center gap-2 border-t border-border pt-2"
            >
              <Text className="flex-1 text-sm">{exercise.name}</Text>
              <Text className="text-xs text-muted-foreground">
                {exercise.targetSets} × {exercise.targetReps}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${exercise.name}`}
                onPress={() => removeExercise(exercise.exerciseId)}
                className="p-1 active:opacity-70"
              >
                <Icon as={X} className="text-muted-foreground" size={14} />
              </Pressable>
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={() => setPicking(true)}
            className="mt-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 active:opacity-70"
          >
            <Icon as={Plus} className="text-primary" size={14} />
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
              Add exercise
            </Text>
          </Pressable>
        </>
      )}

      <ExercisePickerSheet
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={(exercise) => {
          addExercise(exercise);
          setPicking(false);
        }}
      />
    </View>
  );
};
