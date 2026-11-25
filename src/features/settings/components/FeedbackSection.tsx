import { Switch, View } from "react-native";
import { useUniwind } from "uniwind";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { useSettingsStore } from "@/stores/use-settings-store";

/** Haptics, hands-free advancing and sound. */
export const FeedbackSection = () => {
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  const switches = [
    {
      key: "haptics",
      title: "Haptics",
      body: "Vibrate on PRs and completed sets.",
      value: settings.hapticsEnabled,
      onChange: (value: boolean) => setSettings({ hapticsEnabled: value }),
    },
    {
      key: "autoAdvance",
      title: "Hands-free sets",
      body: "When a rest timer ends, jump to the next exercise with sets left so the workout keeps moving without a tap.",
      value: settings.autoAdvance,
      onChange: (value: boolean) => setSettings({ autoAdvance: value }),
    },
    {
      key: "sound",
      title: "Sound",
      body: "Play sounds for PRs and milestones.",
      value: settings.soundEnabled,
      onChange: (value: boolean) => setSettings({ soundEnabled: value }),
    },
  ];

  return (
    <SectionCard title="Feedback">
      {switches.map((row, index) => (
        <View
          key={row.key}
          className={
            index === 0
              ? "flex-row items-center justify-between gap-4"
              : "mt-4 flex-row items-center justify-between gap-4 border-t border-border pt-4"
          }
        >
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold">{row.title}</Text>
            <Text className="text-xs text-muted-foreground">{row.body}</Text>
          </View>
          <Switch
            value={row.value}
            onValueChange={row.onChange}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      ))}
    </SectionCard>
  );
};
