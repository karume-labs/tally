import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface EmptyStateCardProps {
  hasExercises: boolean;
  startedAt: number | null;
}

export const EmptyStateCard = ({
  hasExercises,
  startedAt,
}: EmptyStateCardProps) => {
  if (hasExercises) return null;

  const title = startedAt == null ? "Preparing workout…" : "No exercises";
  const subtitle =
    startedAt == null
      ? "Fetching today's exercises from your active split."
      : "This split day has no exercises. Add them to your split to log sets.";

  return (
    <View className="items-center gap-2 rounded-3xl border border-border bg-card p-6">
      <Text className="text-lg font-bold">{title}</Text>
      <Text className="text-center text-sm text-muted-foreground">
        {subtitle}
      </Text>
    </View>
  );
};
