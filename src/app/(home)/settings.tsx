import { useRouter } from "expo-router";
import { ChevronRight, ListChecks } from "lucide-react-native";
import { Pressable, ScrollView, Switch, View } from "react-native";
import { useUniwind } from "uniwind";
import { OptionChip } from "@/components/shared/OptionChip";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BackupSection } from "@/features/settings/components/BackupSection";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { useSettingsStore } from "@/stores/use-settings-store";

const ROLLOVER_HOURS = [0, 1, 2, 3, 4, 5, 6];
const REST_SECONDS = [0, 30, 60, 90, 120, 150, 180];

// Native flex-wrap does not wrap these chips, so lay them out as fixed rows.
const toRows = <T,>(items: readonly T[], perRow: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / perRow) }, (_, index) =>
    items.slice(index * perRow, index * perRow + perRow),
  );

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      <SectionCard title="Training">
        <View className="gap-2">
          <Text className="text-base font-semibold">Rollover hour</Text>
          <Text className="text-xs text-muted-foreground">
            Workouts before this hour count toward the previous day.
          </Text>
          <View className="mt-1 gap-2">
            {toRows(ROLLOVER_HOURS, 4).map((row) => (
              <View key={row.join("-")} className="flex-row gap-2">
                {row.map((hour) => (
                  <OptionChip
                    key={hour}
                    className="flex-1"
                    label={`${hour}:00`}
                    active={settings.rolloverHour === hour}
                    onPress={() => setSettings({ rolloverHour: hour })}
                  />
                ))}
                {row.length < 4 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 gap-2 border-t border-border pt-4">
          <Text className="text-base font-semibold">Default rest</Text>
          <Text className="text-xs text-muted-foreground">
            Used when an exercise has no rest time of its own.
          </Text>
          <View className="mt-1 gap-2">
            {toRows(REST_SECONDS, 4).map((row) => (
              <View key={row.join("-")} className="flex-row gap-2">
                {row.map((seconds) => (
                  <OptionChip
                    key={seconds}
                    className="flex-1"
                    label={seconds === 0 ? "Off" : `${seconds}s`}
                    active={settings.defaultRestSeconds === seconds}
                    onPress={() => setSettings({ defaultRestSeconds: seconds })}
                  />
                ))}
                {row.length < 4 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Feedback">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold">Haptics</Text>
            <Text className="text-xs text-muted-foreground">
              Vibrate on PRs and completed sets.
            </Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => setSettings({ hapticsEnabled: value })}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>

        <View className="mt-4 flex-row items-center justify-between gap-4 border-t border-border pt-4">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold">Sound</Text>
            <Text className="text-xs text-muted-foreground">
              Play sounds for PRs and milestones.
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => setSettings({ soundEnabled: value })}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </SectionCard>

      <SectionCard title="Library">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-between gap-3 py-2 active:opacity-80"
          onPress={() => router.push("/exercises")}
        >
          <View className="flex-row items-center gap-3">
            <Icon as={ListChecks} className="text-primary" size={20} />
            <View className="gap-0.5">
              <Text className="text-base font-semibold">Exercises</Text>
              <Text className="text-xs text-muted-foreground">
                Browse the exercise library
              </Text>
            </View>
          </View>
          <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
        </Pressable>
      </SectionCard>

      <BackupSection />

      <Text className="pt-1 text-center text-xs text-muted-foreground">
        Tally 1.0 · offline-first workout tracker
      </Text>
    </ScrollView>
  );
}
