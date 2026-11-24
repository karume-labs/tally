import { like } from "drizzle-orm";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export default function ExercisesScreen() {
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const term = query.trim();
    (async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: schema.exercises.id,
          name: schema.exercises.name,
          muscleGroup: schema.exercises.muscleGroup,
          equipment: schema.exercises.equipment,
        })
        .from(schema.exercises)
        .where(
          term === "" ? undefined : like(schema.exercises.name, `%${term}%`),
        )
        .limit(200);
      if (!cancelled) {
        setExercises(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<string, LibraryExercise[]>();
    for (const ex of exercises) {
      const list = map.get(ex.muscleGroup);
      if (list) {
        list.push(ex);
      } else {
        map.set(ex.muscleGroup, [ex]);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [exercises]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-5">
        <TextInput
          className="min-h-12 rounded-xl border border-border bg-card px-4 text-base text-foreground"
          placeholder="Search exercises"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <Text className="mt-2.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={([group]) => group}
        contentContainerClassName="gap-5 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: [group, rows] }) => (
          <View className="gap-2 pb-4">
            <Text className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {group.replace("_", " ")}
            </Text>
            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((ex, index) => (
                <View
                  key={ex.id}
                  className={
                    index === rows.length - 1
                      ? "flex-row items-center justify-between px-4 py-3"
                      : "flex-row items-center justify-between border-b border-border px-4 py-3"
                  }
                >
                  <Text className="flex-1 text-[15px] font-semibold">
                    {ex.name}
                  </Text>
                  <Text className="ml-3 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {ex.equipment ?? "—"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
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
    </View>
  );
}
