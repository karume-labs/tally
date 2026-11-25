import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useUniwind } from "uniwind";
import { Sheet } from "@/components/shared/Sheet";
import { Text } from "@/components/ui/text";
import { listExercises } from "@/db/exercises";
import type { LibraryExercise } from "@/features/exercises/types";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

interface ExercisePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (exercise: LibraryExercise) => void;
}

export const ExercisePickerSheet = ({
  visible,
  onClose,
  onPick,
}: ExercisePickerSheetProps) => {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    listExercises(query.trim()).then((rows) => {
      if (!cancelled) setExercises(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [query, visible]);

  const results = useMemo(() => exercises.slice(0, 60), [exercises]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Add exercise">
      <TextInput
        className="mt-3 min-h-11 rounded-xl border border-border bg-background px-4 text-base text-foreground"
        placeholder="Search exercises"
        placeholderTextColor={colors.mutedForeground}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      <View className="mt-3 gap-1">
        {results.map((exercise) => (
          <Pressable
            key={exercise.id}
            accessibilityRole="button"
            onPress={() => onPick(exercise)}
            className="flex-row items-center justify-between rounded-xl px-3 py-3 active:bg-secondary"
          >
            <Text className="text-sm font-semibold">{exercise.name}</Text>
            <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {exercise.muscleGroup.replace("_", " ")}
            </Text>
          </Pressable>
        ))}
        {results.length === 0 && (
          <Text className="py-6 text-center text-sm text-muted-foreground">
            No exercises match that search.
          </Text>
        )}
      </View>
    </Sheet>
  );
};
