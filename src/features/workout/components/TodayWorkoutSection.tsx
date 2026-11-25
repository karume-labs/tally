import { useRouter } from "expo-router";
import { CalendarDays, ListChecks, Play } from "lucide-react-native";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import type { getTodayInfo, TodayExercise } from "@/db/today";
import { StartRoutineButton } from "./StartRoutineButton";

const PREVIEW_COUNT = 3;

interface TodayWorkoutSectionProps {
  info: Awaited<ReturnType<typeof getTodayInfo>>;
  exercises: TodayExercise[];
}

/** What today holds, with the shortcut into it. */
export const TodayWorkoutSection = ({
  info,
  exercises,
}: TodayWorkoutSectionProps) => {
  const router = useRouter();
  const hasSplit = info != null && info.dayName != null;
  const isRestDay = info?.isRestDay === true;
  const canStart = hasSplit && !isRestDay && exercises.length > 0;

  return (
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
        <View className="gap-3">
          <Text className="text-sm text-muted-foreground">
            {info?.dayName}. Recover, eat, sleep. Tomorrow is yours.
          </Text>
          <StartRoutineButton label="Train a skipped day" />
        </View>
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
        <View className="mt-4 gap-2">
          <ActionButton
            size="lg"
            icon={canStart ? Play : CalendarDays}
            label={canStart ? "Start workout" : "View today"}
            disabled={!canStart}
            onPress={() => router.push(canStart ? "/workout" : "/today")}
          />
          <StartRoutineButton />
        </View>
      )}
    </SectionCard>
  );
};
