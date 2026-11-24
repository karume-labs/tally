import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";
import {
  createCustomExercise,
  deleteCustomExercise,
  listExercises,
  updateCustomExercise,
} from "@/db/exercises";
import { ExerciseFormModal } from "@/features/exercises/components/ExerciseFormModal";
import { ExerciseLibraryList } from "@/features/exercises/components/ExerciseLibraryList";
import type {
  ExerciseDraft,
  LibraryExercise,
} from "@/features/exercises/types";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

export default function ExercisesScreen() {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LibraryExercise | "new" | null>(null);

  useEffect(() => {
    let cancelled = false;
    listExercises(query.trim()).then((rows) => {
      if (cancelled) return;
      setExercises(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const refresh = useCallback(async () => {
    setExercises(await listExercises(query.trim()));
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<string, LibraryExercise[]>();
    for (const exercise of exercises) {
      const list = map.get(exercise.muscleGroup);
      if (list) {
        list.push(exercise);
      } else {
        map.set(exercise.muscleGroup, [exercise]);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [exercises]);

  const saveExercise = async (draft: ExerciseDraft) => {
    if (draft.id == null) {
      await createCustomExercise(draft);
    } else {
      await updateCustomExercise(draft.id, draft);
    }
    setEditing(null);
    await refresh();
  };

  const removeExercise = async (id: string) => {
    await deleteCustomExercise(id);
    setEditing(null);
    await refresh();
  };

  return (
    <View className="flex-1 bg-background">
      <View className="gap-3 px-5 pt-5">
        <TextInput
          className="min-h-12 rounded-xl border border-border bg-card px-4 text-base text-foreground"
          placeholder="Search exercises"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <ActionButton
          icon={Plus}
          label="Add custom exercise"
          variant="secondary"
          onPress={() => setEditing("new")}
        />
        <Text className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={([group]) => group}
        contentContainerClassName="gap-5 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ExerciseLibraryList groups={[item]} onEdit={setEditing} />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="text-sm text-muted-foreground">
                No exercises match "{query.trim()}".
              </Text>
            )}
          </View>
        }
      />

      {editing != null && (
        <ExerciseFormModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={saveExercise}
          onDelete={removeExercise}
        />
      )}
    </View>
  );
}
