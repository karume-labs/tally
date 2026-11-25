import { Dumbbell } from "lucide-react-native";
import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { TodayExercise } from "@/db/today";
import { ExerciseGroupList } from "./ExerciseGroupList";

interface TodayPlanCardProps {
  dayName: string | null;
  totalSets: number;
  exercises: TodayExercise[];
}

/** Today's split day and its exercises. */
export const TodayPlanCard = ({
  dayName,
  totalSets,
  exercises,
}: TodayPlanCardProps) => (
  <>
    <SectionCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-1">
          <Text className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Today
          </Text>
          <View className="flex-row items-center gap-2">
            <Icon as={Dumbbell} className="text-primary" size={22} />
            <Text className="text-2xl font-black tracking-tight">
              {dayName}
            </Text>
          </View>
        </View>
        <View className="items-center rounded-xl bg-secondary px-3 py-2">
          <Text className="text-lg font-black tabular-nums">{totalSets}</Text>
          <Text className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            sets
          </Text>
        </View>
      </View>
    </SectionCard>

    <SectionCard title="Exercises">
      {exercises.length === 0 ? (
        <Text className="text-sm text-muted-foreground">
          This day has no exercises yet.
        </Text>
      ) : (
        <ExerciseGroupList exercises={exercises} />
      )}
    </SectionCard>
  </>
);
