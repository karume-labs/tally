import { useFocusEffect, useRouter } from "expo-router";
import { Dumbbell, Play } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { type AdjacentDays, getAdjacentDays } from "@/db/split-days";
import {
  getTodayExercises,
  getTodayInfo,
  type TodayExercise,
} from "@/db/today";
import { AdjacentDaysCard } from "@/features/workout/components/AdjacentDaysCard";
import { ExerciseGroupList } from "@/features/workout/components/ExerciseGroupList";
import { StartRoutineButton } from "@/features/workout/components/StartRoutineButton";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { useSettingsStore } from "@/stores/use-settings-store";

type TodayInfo = Awaited<ReturnType<typeof getTodayInfo>>;

export default function TodayScreen() {
  const router = useRouter();
  const scheme = schemeFromTheme(useUniwind().theme);
  const accent = TALLY_THEME[scheme].primary;
  const [info, setInfo] = useState<TodayInfo>(null);
  const [exercises, setExercises] = useState<TodayExercise[]>([]);
  const rolloverHour = useSettingsStore((s) => s.settings.rolloverHour);
  const [adjacent, setAdjacent] = useState<AdjacentDays>({
    yesterdayName: null,
    yesterdayTrained: false,
    yesterdayIsRest: false,
    tomorrowName: null,
    tomorrowIsRest: false,
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [todayInfo, todayExercises, around] = await Promise.all([
          getTodayInfo(),
          getTodayExercises(),
          getAdjacentDays(rolloverHour),
        ]);
        if (cancelled) return;
        setInfo(todayInfo);
        setExercises(todayExercises ?? []);
        setAdjacent(around);
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [rolloverHour]),
  );

  const hasSplit = info != null && info.dayName != null;
  const isRestDay = info?.isRestDay === true;
  const totalSets = exercises.reduce(
    (sum, ex) => sum + (ex.targetSets ?? 0),
    0,
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={accent} />
          <Text className="mt-3 text-sm text-muted-foreground">
            Loading today's plan…
          </Text>
        </View>
      ) : !hasSplit ? (
        <SectionCard title="No active split">
          <Text className="text-sm text-muted-foreground">
            Pick a program and today's exercises will show up here
            automatically.
          </Text>
          <ActionButton
            className="mt-4"
            icon={Dumbbell}
            label="Browse splits"
            onPress={() => router.push("/splits")}
          />
        </SectionCard>
      ) : isRestDay ? (
        <>
          <SectionCard
            title={info?.dayName ?? "Rest day"}
            action={
              <Text className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                Rest day
              </Text>
            }
          >
            <Text className="text-sm text-muted-foreground">
              No lifting scheduled. Recovery is part of the program — or make up
              a day you skipped.
            </Text>
            <View className="mt-4">
              <StartRoutineButton label="Train a skipped day" />
            </View>
          </SectionCard>
          <AdjacentDaysCard adjacent={adjacent} />
        </>
      ) : (
        <>
          <SectionCard>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 gap-1">
                <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  Today
                </Text>
                <View className="flex-row items-center gap-2">
                  <Icon as={Dumbbell} className="text-primary" size={22} />
                  <Text className="text-2xl font-black tracking-tight">
                    {info?.dayName}
                  </Text>
                </View>
              </View>
              <View className="items-center rounded-xl bg-secondary px-3 py-2">
                <Text className="text-lg font-black tabular-nums">
                  {totalSets}
                </Text>
                <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  sets
                </Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard title="Exercises">
            {exercises.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                This day has no exercises yet.
              </Text>
            ) : (
              <ExerciseGroupList exercises={exercises} />
            )}
          </SectionCard>

          <ActionButton
            size="lg"
            icon={Play}
            label="Start workout"
            disabled={exercises.length === 0}
            onPress={() => router.push("/workout")}
          />
          <StartRoutineButton />
          <AdjacentDaysCard adjacent={adjacent} />
        </>
      )}
    </ScrollView>
  );
}
