import { Check } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/shared/types/workout-types";

interface WorkoutSetRowProps {
  set: WorkoutSet;
}

export const WorkoutSetRow = ({ set }: WorkoutSetRowProps) => {
  const weight = set.weight != null ? `${set.weight} kg` : "—";
  const reps = set.reps != null ? `${set.reps}` : "—";
  const rpe = set.rpe != null ? ` @ ${set.rpe}` : "";

  return (
    <View className="flex-row items-center gap-2 border-b border-border py-2">
      <Text className="w-12 text-xs text-muted-foreground">
        Set {set.setNumber}
      </Text>
      <Text className="flex-1 text-sm font-semibold">
        {weight} × {reps}
        {rpe}
      </Text>
      <View className="flex-row items-center gap-2">
        {set.isPR && (
          <Text className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            PR
          </Text>
        )}
        <Icon
          as={Check}
          size={16}
          className={cn(
            set.completed ? "text-success" : "text-muted-foreground",
          )}
        />
      </View>
    </View>
  );
};
