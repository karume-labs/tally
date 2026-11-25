import { eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Pencil } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { SplitDayPlans } from "@/features/splits/components/SplitDayPlans";
import { WeekSchedule } from "@/features/splits/components/WeekSchedule";
import { useSplits } from "@/features/splits/hooks/use-splits";
import type { SplitDayPlan } from "@/features/splits/types";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

export default function SplitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const { splits, loading, activateSplit } = useSplits();
  const [days, setDays] = useState<SplitDayPlan[]>([]);
  const [activating, setActivating] = useState(false);
  const split = splits.find((s) => s.id === id);

  useEffect(() => {
    if (split == null) return;
    let cancelled = false;
    (async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.splitDays)
        .where(eq(schema.splitDays.splitId, split.id))
        .orderBy(schema.splitDays.dayOrder);
      const withCounts: SplitDayPlan[] = [];
      for (const row of rows) {
        const links = await db
          .select({ id: schema.splitDayExercises.id })
          .from(schema.splitDayExercises)
          .where(eq(schema.splitDayExercises.splitDayId, row.id));
        withCounts.push({
          id: row.id,
          name: row.name,
          isRestDay: row.isRestDay,
          exerciseCount: links.length,
        });
      }
      if (!cancelled) setDays(withCounts);
    })();
    return () => {
      cancelled = true;
    };
  }, [split]);

  if (loading && split == null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (split == null) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text className="text-base font-semibold">Split not found</Text>
        <ActionButton
          variant="secondary"
          label="Back to splits"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      <SectionCard>
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 text-2xl font-extrabold">{split.name}</Text>
          {split.isActive && (
            <Text className="rounded-md bg-primary/15 px-2 py-1 text-xs font-bold text-primary">
              Active
            </Text>
          )}
        </View>
        {split.description !== "" && (
          <Text className="mt-2 text-sm text-muted-foreground">
            {split.description}
          </Text>
        )}
        <ActionButton
          className="mt-4"
          variant="secondary"
          icon={Pencil}
          label="Edit split"
          onPress={() =>
            router.push({
              pathname: "/splits/edit",
              params: { id: split.id },
            })
          }
        />
        {!split.isActive && (
          <ActionButton
            className="mt-2"
            icon={Check}
            label={activating ? "Activating…" : "Set as active"}
            disabled={activating}
            onPress={async () => {
              setActivating(true);
              try {
                await activateSplit(split.id);
                router.back();
              } finally {
                setActivating(false);
              }
            }}
          />
        )}
      </SectionCard>

      <WeekSchedule schedule={split.schedule} days={days} />

      <SectionCard title="Day plans">
        {days.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            No days defined for this split.
          </Text>
        ) : (
          <SplitDayPlans days={days} />
        )}
      </SectionCard>
    </ScrollView>
  );
}
