import { ScrollView } from "react-native";
import { StreakCounter } from "@/features/streak/components/StreakCounter";

export default function StreakScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-5 pb-24"
    >
      <StreakCounter />
    </ScrollView>
  );
}
