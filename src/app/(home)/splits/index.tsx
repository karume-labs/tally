import { useFocusEffect, useRouter } from "expo-router";
import { Layers, Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { SplitCard } from "@/features/splits/components/SplitCard";
import { useSplits } from "@/features/splits/hooks/use-splits";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

export default function SplitsScreen() {
  const router = useRouter();
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const { splits, loading, refetch } = useSplits();
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});

  // Re-read after returning from a detail screen so "Active" reflects the
  // split that was just activated.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await getDb().select().from(schema.splitDays);
      if (cancelled) return;
      // Count day templates, not weekday slots: presets repeat the same plan
      // across the week, and the detail screen shows the weekly cadence.
      const counts: Record<string, number> = {};
      for (const row of rows) {
        if (row.isRestDay === true) continue;
        counts[row.splitId] = (counts[row.splitId] ?? 0) + 1;
      }
      setDayCounts(counts);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-sm text-muted-foreground">
          Loading splits…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      <Text className="text-sm leading-5 text-muted-foreground">
        Pick the program you are running. Exactly one split is active at a time,
        and today's workout follows its schedule.
      </Text>

      <ActionButton
        icon={Plus}
        label="Build your own split"
        onPress={() => router.push("/splits/edit")}
      />

      {splits.length === 0 ? (
        <SectionCard>
          <View className="items-center gap-2 py-6">
            <Icon as={Layers} className="text-muted-foreground" size={28} />
            <Text className="text-base font-semibold">No splits yet</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Preset programs are seeded on first launch. Reopen the app if this
              stays empty.
            </Text>
          </View>
        </SectionCard>
      ) : (
        splits.map((split) => (
          <SplitCard
            key={split.id}
            name={split.name}
            description={split.description}
            isActive={split.isActive}
            dayCount={dayCounts[split.id]}
            onPress={() =>
              router.push({
                pathname: "/splits/[id]",
                params: { id: split.id },
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}
