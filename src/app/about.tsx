import Constants from "expo-constants";
import { Code, Database, HeartPulse, ShieldCheck } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { TallyLogo } from "@/components/shared/TallyLogo";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const version = Constants.expoConfig?.version ?? "1.0.0";

// Spelled out because the app leans on these words everywhere and none of them
// are standard outside Tally.
const TERMS = [
  {
    term: "Log day",
    body: "The day a session counts for. It starts at your day boundary, not at midnight.",
  },
  {
    term: "Split",
    body: "A program: a set of day templates that cycle across the week, one active at a time.",
  },
  {
    term: "Superset",
    body: "Exercises sharing a letter label, performed back to back before resting.",
  },
  {
    term: "Freeze",
    body: "A token that repairs one missed day so a streak survives a bad week.",
  },
];

export default function AboutScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      <View className="items-center gap-2 py-4">
        <TallyLogo size={72} />
        <Text className="mt-2 text-2xl font-black uppercase tracking-[0.22em]">
          Tally
        </Text>
        <Text className="text-xs font-semibold text-muted-foreground">
          Version {version}
        </Text>
      </View>

      <SectionCard title="About the app">
        <Text className="text-sm leading-6 text-muted-foreground">
          Tally is a privacy-first workout tracker. It plans your week, logs
          your sets and keeps a streak, entirely on this phone. No account, no
          cloud, no analytics — your training never leaves the device.
        </Text>
      </SectionCard>

      <SectionCard title="How it works">
        <View className="gap-3">
          {TERMS.map((entry) => (
            <View key={entry.term} className="gap-0.5">
              <Text className="text-sm font-semibold">{entry.term}</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                {entry.body}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Privacy and licence">
        <View className="gap-4">
          <View className="flex-row items-start gap-3">
            <Icon as={ShieldCheck} className="text-primary" size={20} />
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold">100% local</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                Workouts live in a SQLite database on the device. Backups are
                files you export yourself.
              </Text>
            </View>
          </View>
          <View className="flex-row items-start gap-3 border-t border-border pt-3">
            <Icon as={Database} className="text-primary" size={20} />
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold">No telemetry</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                There is no server to receive anything, and no permission beyond
                notifications and widgets is asked for.
              </Text>
            </View>
          </View>
          <View className="flex-row items-start gap-3 border-t border-border pt-3">
            <Icon as={Code} className="text-primary" size={20} />
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold">Source and terms</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                Built by karume-labs. Distributed for personal use; not for
                commercial redistribution or model training.
              </Text>
            </View>
          </View>
        </View>
      </SectionCard>

      <View className="flex-row items-center justify-center gap-2 pt-2">
        <Icon as={HeartPulse} className="text-muted-foreground" size={14} />
        <Text className="text-xs text-muted-foreground">
          Show up. The streak takes care of itself.
        </Text>
      </View>
    </ScrollView>
  );
}
