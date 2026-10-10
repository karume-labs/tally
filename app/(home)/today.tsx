import { Stack, useRouter } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import {
  getTodayExercises,
  getTodayInfo,
  type TodayExercise,
} from "@/db/today";
import { NAV_THEME } from "@/lib/theme";

const THEME = NAV_THEME.dark;
const CARD_BG = "#1a1a2e";
const BORDER = "#2a2a40";
const WORKOUT = "#4ade80";
const MUTED = "#9ca3af";
const FORE = "#e5e5e5";

export default function TodayScreen() {
  const router = useRouter();
  const [info, setInfo] = useState<Awaited<
    ReturnType<typeof getTodayInfo>
  > | null>(null);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [infoResult, exercisesResult] = await Promise.all([
        getTodayInfo(),
        getTodayExercises(),
      ]);
      setInfo(infoResult);
      setExercises(exercisesResult ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const hasSplit = info != null && info.dayName != null;

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Today",
          headerBackTitle: "Tally",
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={WORKOUT}
          />
        }
      >
        {/* Active split status */}
        <View style={styles.card}>
          {loading ? (
            <Text style={[styles.muted, styles.center]}>Loading…</Text>
          ) : !hasSplit ? (
            <>
              <Text style={styles.sectionTitle}>No active split</Text>
              <Text style={[styles.muted, styles.center]}>
                Pick a split in Settings to see today's workout here.
              </Text>
            </>
          ) : info?.isRestDay ? (
            <>
              <View style={styles.dayRow}>
                <View style={styles.restBadge}>
                  <Text style={styles.restText}>Rest day</Text>
                </View>
                <Text style={styles.dayName}>{info?.dayName}</Text>
              </View>
              <Text style={[styles.muted, styles.center]}>
                Rest up — you've got a workout scheduled tomorrow.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.dayRow}>
                <Dumbbell size={18} color={WORKOUT} />
                <Text style={styles.dayName}>{info?.dayName}</Text>
              </View>
              <Text style={[styles.muted, styles.center]}>
                {exercises.length} exercise{exercises.length === 1 ? "" : "s"}{" "}
                planned
              </Text>
            </>
          )}
        </View>

        {/* Exercise list */}
        {hasSplit && !info?.isRestDay && exercises.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {exercises.map((ex, i) => (
              <View key={ex.id} style={styles.exRow}>
                <View style={styles.exIndex}>
                  <Text style={styles.exIndexText}>{i + 1}</Text>
                </View>
                <View style={styles.exBody}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <View style={styles.exMeta}>
                    {ex.targetSets != null && ex.targetReps != null && (
                      <Text style={styles.exTarget}>
                        {ex.targetSets} × {ex.targetReps}
                      </Text>
                    )}
                    {ex.restSeconds > 0 && (
                      <Text style={styles.exRest}>{ex.restSeconds}s rest</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Start button */}
        {hasSplit && !info?.isRestDay && exercises.length > 0 && (
          <Button
            size="lg"
            variant="default"
            onPress={() => router.push("/workout" as any)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: FORE,
    marginBottom: 12,
  },
  muted: { color: MUTED },
  center: { textAlign: "center" },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  dayName: { fontSize: 20, fontWeight: "700", color: FORE },
  restBadge: {
    backgroundColor: "#2a4a3a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: WORKOUT,
  },
  restText: { fontSize: 13, color: WORKOUT, fontWeight: "600" },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  exIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2a2a40",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  exIndexText: { fontSize: 12, fontWeight: "700", color: WORKOUT },
  exBody: { flex: 1 },
  exName: { fontSize: 16, fontWeight: "600", color: FORE },
  exMeta: { flexDirection: "row", gap: 12, marginTop: 2 },
  exTarget: { fontSize: 13, color: MUTED },
  exRest: { fontSize: 13, color: MUTED },
  startButton: {
    marginTop: 4,
    backgroundColor: WORKOUT,
    borderRadius: 12,
    paddingBottom: 4,
  },
  startButtonText: { color: "#0a0a14", fontWeight: "700", fontSize: 16 },
});
