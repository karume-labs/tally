import { View } from "react-native";
import { OptionChip } from "@/components/shared/OptionChip";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { useSettingsStore } from "@/stores/use-settings-store";

const ROLLOVER_HOURS = [0, 1, 2, 3, 4, 5, 6];
const REST_SECONDS = [0, 30, 60, 90, 120, 150, 180];

// Native flex-wrap does not wrap these chips, so lay them out as fixed rows.
const toRows = <T,>(items: readonly T[], perRow: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / perRow) }, (_, index) =>
    items.slice(index * perRow, index * perRow + perRow),
  );

/** Day boundary and default rest, the two settings that reshape a session. */
export const TrainingSection = () => {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  return (
    <SectionCard title="Training">
      <View className="gap-2">
        <Text className="text-base font-semibold">Day boundary</Text>
        <Text className="text-xs leading-4 text-muted-foreground">
          Tally's log day starts here, not at midnight. With 06:00, a 1 a.m.
          session still counts for yesterday — good for late nights. It moves
          the streak day, the history dots and the widgets together. Your split
          still follows the calendar weekday.
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
  );
};
