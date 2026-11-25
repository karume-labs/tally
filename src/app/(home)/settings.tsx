import { useRouter } from "expo-router";
import { ChevronRight, Info, ListChecks } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BackupSection } from "@/features/settings/components/BackupSection";
import { FeedbackSection } from "@/features/settings/components/FeedbackSection";
import { TrainingSection } from "@/features/settings/components/TrainingSection";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
    >
      <TrainingSection />

      <FeedbackSection />

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

      <SectionCard title="App">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-between gap-3 py-2 active:opacity-80"
          onPress={() => router.push("/about")}
        >
          <View className="flex-row items-center gap-3">
            <Icon as={Info} className="text-primary" size={20} />
            <View className="gap-0.5">
              <Text className="text-base font-semibold">About Tally</Text>
              <Text className="text-xs text-muted-foreground">
                Privacy, licence and how the domain works
              </Text>
            </View>
          </View>
          <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
        </Pressable>
      </SectionCard>

      <Text className="pt-1 text-center text-xs text-muted-foreground">
        Tally 1.0 · offline-first workout tracker
      </Text>
    </ScrollView>
  );
}
