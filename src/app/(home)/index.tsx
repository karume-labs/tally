import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/shared/ActionButton";
import { DayDotRow } from "@/components/shared/DayDotRow";
import { SectionCard } from "@/components/shared/SectionCard";
import { TallyLogo } from "@/components/shared/TallyLogo";
import { Text } from "@/components/ui/text";
import { loadRecentHistory } from "@/db/streak-history";
import {
  getTodayExercises,
  getTodayInfo,
  type TodayExercise,
} from "@/db/today";
import { StreakLevelCard } from "@/features/streak/components/StreakLevelCard";
import { TodayWorkoutSection } from "@/features/workout/components/TodayWorkoutSection";
import { last7DayDots } from "@/services/streak";
import { useStreakStore } from "@/stores/use-streak-store";

type TodayInfo = Awaited<ReturnType<typeof getTodayInfo>>;

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

      <StreakLevelCard />

      <TodayWorkoutSection info={info} exercises={exercises} />

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
