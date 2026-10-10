import { Stack, useRouter } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { Button } from "@/components/ui/button";
import { EQUIPMENT, MUSCLE_GROUPS } from "@/lib/constants";
import { NAV_THEME } from "@/lib/theme";
import { last7DayDots } from "@/services/streak";
import { useStreakStore } from "@/stores/useStreakStore";
import {
  useWorkoutStore,
  type WorkoutExercise,
} from "@/stores/useWorkoutStore";

const THEME = NAV_THEME.dark;
const CARD_BG = "#1a1a2e";
const BORDER = "#2a2a40";
const MISSED = "#1a1a2e";
const WORKOUT = "#4ade80";

export default function HomeScreen() {
  const router = useRouter();
  const streak = useStreakStore((s) => s.row);
  const exercises = useWorkoutStore((s) => s.exercises);
  const isRestDay = useWorkoutStore((s) => s.isRestDay);

  const handleAddExercise = useCallback(() => {
    useWorkoutStore.getState().addExercise({
      exerciseId: "bench-press",
      name: "Bench Press",
      muscleGroup: MUSCLE_GROUPS[0],
      equipment: EQUIPMENT[0],
      targetSets: 4,
      targetReps: "8-10",
      restSeconds: 90,
      notes: "",
      sets: [],
    } as WorkoutExercise);
  }, []);

  const dots = useMemo(
    () => last7DayDots([], streak?.lastLogDayKey ?? null),
    [streak?.lastLogDayKey],
  );

  const dotsWithLabel = useMemo(
    () =>
      dots.map((d, i) => {
        const labels = ["M", "T", "W", "T", "F", "S", "S"];
        const color =
          d.status === "workout"
            ? WORKOUT
            : d.status === "missed"
              ? MISSED
              : MISSED;
        return { label: labels[i] ?? "", color };
      }),
    [dots],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Let's go. 👋</Text>
          <Text style={styles.subGreeting}>Today's workout is on deck.</Text>
        </View>

        {/* Streak card */}
        <View style={styles.card}>
          <View style={styles.streakRow}>
            <StreakFlame
              streak={streak?.currentStreak ?? 0}
              size="lg"
              theme={THEME}
            />
            <View style={styles.streakMeta}>
              <Text style={styles.streakLabel}>
                {streak?.currentStreak ?? 0} day streak
              </Text>
            </View>
          </View>
          <View style={styles.xpRow}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBar, { width: "0%" }]} />
            </View>
            <View style={styles.xpTextRow}>
              <Text style={styles.xpText}>{streak?.xp ?? 0} XP</Text>
              <Text style={styles.xpTextMuted}>/ 500 to next level</Text>
            </View>
          </View>
        </View>

        {/* Today's workout card */}
        <View style={styles.card}>
          <View style={styles.todayHeader}>
            <View style={styles.todayTitleRow}>
              <Text style={styles.todayTitle}>Today's Workout</Text>
              {isRestDay && (
                <View style={styles.restBadge}>
                  <Text style={styles.restText}>Rest day</Text>
                </View>
              )}
            </View>
          </View>
          {exercises.length > 0 && (
            <>
              <Text style={styles.todayExerciseLabel}>
                {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
              </Text>
              <View style={styles.exercisePreview}>
                {exercises.slice(0, 3).map((ex) => (
                  <View key={ex.exerciseId} style={styles.exerciseChip}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                  </View>
                ))}
                {exercises.length > 3 && (
                  <Text style={styles.moreText}>
                    +{exercises.length - 3} more
                  </Text>
                )}
              </View>
            </>
          )}
          <Button
            size="lg"
            variant="default"
            onPress={() => router.push("/today" as any)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </Button>
        </View>

        {/* Weekly activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <View style={styles.weekRow}>
            {dotsWithLabel.map((d, i) => (
              <View
                key={i}
                style={[styles.dayCell, { backgroundColor: d.color }]}
              >
                <Text style={styles.dayLetter}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsRow}>
            <Button
              variant="secondary"
              size="lg"
              onPress={handleAddExercise}
              style={styles.actionButton}
            >
              <Plus size={18} />
              <Text style={styles.actionText}>Add Exercise</Text>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onPress={() => {
                useWorkoutStore.getState().reset();
              }}
              style={styles.actionButton}
            >
              <Trash2 size={18} />
              <Text style={styles.actionText}>Clear</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SCREEN_OPTIONS = {
  title: "Tally",
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 16 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: "800", color: "#e5e5e5" },
  subGreeting: { fontSize: 16, color: "#9ca3af", marginTop: 4 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  streakRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  streakMeta: { marginLeft: 12 },
  streakLabel: { fontSize: 22, fontWeight: "700", color: "#e5e5e5" },
  xpRow: { marginTop: 4 },
  xpBarBg: {
    height: 8,
    backgroundColor: "#2a2a40",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  xpBar: { height: "100%", backgroundColor: WORKOUT, borderRadius: 4 },
  xpTextRow: { flexDirection: "row", justifyContent: "space-between" },
  xpText: { fontSize: 14, fontWeight: "600", color: WORKOUT },
  xpTextMuted: { fontSize: 12, color: "#9ca3af" },
  todayHeader: { marginBottom: 8 },
  todayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayTitle: { fontSize: 18, fontWeight: "600", color: "#e5e5e5" },
  restBadge: {
    backgroundColor: "#2a4a3a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: WORKOUT,
  },
  restText: { fontSize: 12, color: WORKOUT, fontWeight: "600" },
  todayExerciseLabel: { fontSize: 14, color: "#9ca3af", marginBottom: 8 },
  exercisePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  exerciseChip: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  exerciseName: { fontSize: 13, color: "#e5e5e5" },
  moreText: {
    fontSize: 13,
    color: "#9ca3af",
    alignSelf: "center",
    marginLeft: 4,
  },
  startButton: { marginTop: 4, backgroundColor: WORKOUT, borderRadius: 12 },
  startButtonText: { color: "#0a0a14", fontWeight: "700", fontSize: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e5e5",
    marginBottom: 12,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLetter: { fontSize: 12, fontWeight: "600", color: "#9ca3af" },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: "600" },
});
