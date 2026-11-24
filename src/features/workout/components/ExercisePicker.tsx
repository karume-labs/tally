import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

interface ExercisePickerProps {
  onSelect: (id: string, name: string) => void;
}

export const ExercisePicker = ({ onSelect }: ExercisePickerProps) => {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<
    Array<{ id: string; name: string; equipment: string | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const db = getDb();
      const likeQuery = query.trim() === "" ? undefined : `%${query.trim()}%`;
      const fetched = await db
        .select({
          id: schema.exercises.id,
          name: schema.exercises.name,
          equipment: schema.exercises.equipment,
        })
        .from(schema.exercises)
        .where(likeQuery != null ? undefined : undefined)
        .limit(60);
      if (!cancelled) {
        setRows(fetched);
        setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const _muscleOrder = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "full_body",
  ];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const ex of rows) {
      const list = map.get(ex.name.split(" ")[0]) ?? [];
      list.push(ex);
      map.set(ex.name.split(" ")[0], list);
    }
    return map;
  }, [rows]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        placeholder="Search exercises..."
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      <FlatList
        data={Array.from(grouped.keys())}
        keyExtractor={(k) => k}
        renderItem={({ item: key }) => (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            {grouped.get(key)?.map((ex) => (
              <Text
                key={ex.id}
                style={styles.row}
                onPress={() => onSelect(ex.id, ex.name)}
              >
                {ex.name}
                <Text style={styles.equip}>{ex.equipment ?? "—"}</Text>
              </Text>
            ))}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : (
            <Text style={styles.empty}>No exercises found.</Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  search: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#e5e5e5",
    borderWidth: 1,
    borderColor: "#2a2a40",
    margin: 12,
  },
  group: { marginBottom: 12 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginLeft: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a40",
  },
  equip: { fontSize: 13, color: "#9ca3af" },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 20 },
});
