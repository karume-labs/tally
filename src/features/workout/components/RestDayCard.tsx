import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";

interface RestDayCardProps {
  dayName: string;
  onBack: () => void;
}

export const RestDayCard = ({ dayName, onBack }: RestDayCardProps) => (
  <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
    <Text className="text-base font-semibold">Rest day</Text>
    <Text className="text-center text-sm text-muted-foreground">
      {dayName} is scheduled as recovery. No session was started.
    </Text>
    <ActionButton variant="secondary" label="Back" onPress={onBack} />
  </View>
);
