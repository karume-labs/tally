import { useFocusEffect, useRouter } from "expo-router";
import { CalendarDays, ListChecks, Play } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";
import { DayDotRow } from "@/components/shared/DayDotRow";
import { SectionCard } from "@/components/shared/SectionCard";
import { StreakFlame } from "@/components/shared/StreakFlame";
import { TallyLogo } from "@/components/shared/TallyLogo";
import { Text } from "@/components/ui/text";
import { loadRecentHistory } from "@/db/streak-history";
import {
  getTodayExercises,
  getTodayInfo,
  type TodayExercise,
} from "@/db/today";
import { last7DayDots } from "@/services/streak";
import { useStreakStore } from "@/stores/use-streak-store";

type TodayInfo = Awaited<ReturnType<typeof getTodayInfo>>;

const PREVIEW_COUNT = 3;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const streak = useStreakStore((s) => s.row);
  const [info, setInfo] = useState<TodayInfo>(null);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);
  const [history, setHistory] = useState<
    Array<{ dayKey: string; status: string }>
  >([]);

  // Reload on focus: the DB bootstrap finishes after first render, and a
  // workout on another screen changes the streak and history here.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [todayInfo, todayExercises, pastDays] = await Promise.all([
          getTodayInfo(),
          getTodayExercises(),
          loadRecentHistory(),
        ]);
        if (cancelled) return;
        setInfo(todayInfo);
        setExercises(todayExercises ?? []);
        setHistory(pastDays);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const dots = useMemo(
    () => last7DayDots(history, streak?.lastLogDayKey ?? null),
    [history, streak?.lastLogDayKey],
  );

  const hasSplit = info != null && info.dayName != null;
  const isRestDay = info?.isRestDay === true;
  const canStart = hasSplit && !isRestDay && exercises.length > 0;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-5 pb-24"
      contentContainerStyle={{ paddingTop: insets.top + 24 }}
    >
      <View className="mb-1 flex-row items-center gap-3">
        <TallyLogo size={42} />
        <View className="gap-0.5">
          <Text className="text-lg font-black uppercase tracking-[0.28em]">
            Tally
          </Text>
          <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Train log
          </Text>
        </View>
      </View>

      <View className="mb-1 gap-1">
        <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          {today}
        </Text>
        <Text className="text-4xl font-black tracking-tight">Let's go.</Text>
        <Text className="text-base text-muted-foreground">
          Show up today. The streak takes care of itself.
        </Text>
      </View>

      <SectionCard>
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Current streak
            </Text>
            <StreakFlame streak={streak?.currentStreak ?? 0} size="md" />
            <Text className="text-xs font-semibold text-muted-foreground">
              {streak?.currentStreak === 1 ? "day" : "days"} strong
            </Text>
          </View>
          <View className="items-center gap-0.5 rounded-2xl border border-border bg-secondary px-4 py-3">
            <Text className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Level
            </Text>
            <Text className="text-3xl font-black tabular-nums">
              {streak?.level ?? 1}
            </Text>
            <Text className="text-[10px] font-semibold text-muted-foreground">
              {streak?.xp ?? 0} XP
            </Text>
          </View>
        </View>
        <View className="mt-4 h-3 overflow-hidden rounded-full border border-border bg-secondary">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${((streak?.xp ?? 0) % 500) / 5}%` }}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Today's workout"
        action={
          isRestDay ? (
            <Text className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
              Rest day
            </Text>
          ) : null
        }
      >
        {!hasSplit ? (
          <View className="gap-3">
            <Text className="text-sm text-muted-foreground">
              No split is active yet. Pick a program and Tally will plan your
              days.
            </Text>
            <ActionButton
              icon={ListChecks}
              label="Choose a split"
              onPress={() => router.push("/splits")}
            />
          </View>
        ) : isRestDay ? (
          <Text className="text-sm text-muted-foreground">
            {info?.dayName}. Recover, eat, sleep. Tomorrow is yours.
          </Text>
        ) : (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black tracking-tight">
                {info?.dayName}
              </Text>
              <Text className="text-sm font-semibold text-muted-foreground">
                {exercises.length} exercise
                {exercises.length === 1 ? "" : "s"}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {exercises.slice(0, PREVIEW_COUNT).map((ex) => (
                <View
                  key={ex.id}
                  className="rounded-lg border border-border bg-background px-2.5 py-1"
                >
                  <Text className="text-xs font-semibold text-secondary-foreground">
                    {ex.name}
                  </Text>
                </View>
              ))}
              {exercises.length > PREVIEW_COUNT && (
                <View className="justify-center px-1">
                  <Text className="text-xs font-semibold text-muted-foreground">
                    +{exercises.length - PREVIEW_COUNT} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {hasSplit && !isRestDay && (
          <ActionButton
            size="lg"
            className="mt-4"
            icon={canStart ? Play : CalendarDays}
            label={canStart ? "Start workout" : "View today"}
            disabled={!canStart}
            onPress={() => router.push(canStart ? "/workout" : "/today")}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Last 7 days"
        action={
          <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {dots.filter((d) => d.status === "workout").length} trained
          </Text>
        }
      >
        <DayDotRow dots={dots} />
      </SectionCard>

      <View className="flex-row gap-3">
        <ActionButton
          variant="secondary"
          className="flex-1"
          label="Exercises"
          onPress={() => router.push("/exercises")}
        />
        <ActionButton
          variant="secondary"
          className="flex-1"
          label="Last workout"
          onPress={() => router.push("/workout/summary")}
        />
      </View>
    </ScrollView>
  );
}
