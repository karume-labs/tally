import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { AdjacentDays } from "@/db/adjacent-days";

interface AdjacentDaysCardProps {
  adjacent: AdjacentDays;
}

// Rest comes from the split day's flag, not its name: a rest day is whatever
// the user called it.
const isRest = (name: string | null, flag: boolean) => name == null || flag;

export const AdjacentDaysCard = ({ adjacent }: AdjacentDaysCardProps) => (
  <SectionCard title="Around today">
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <Icon as={CalendarDays} className="text-muted-foreground" size={18} />
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Yesterday
          </Text>
          <Text className="text-sm font-semibold">
            {adjacent.yesterdayName ?? "Nothing scheduled"}
            {!isRest(adjacent.yesterdayName, adjacent.yesterdayIsRest) &&
              (adjacent.yesterdayTrained ? " · trained" : " · not logged")}
          </Text>
        </View>
        {adjacent.yesterdayTrained && (
          <Icon as={CheckCircle2} className="text-primary" size={18} />
        )}
      </View>

      <View className="flex-row items-center gap-3 border-t border-border pt-3">
        <Icon as={ArrowRight} className="text-muted-foreground" size={18} />
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Tomorrow
          </Text>
          <Text className="text-sm font-semibold">
            {isRest(adjacent.tomorrowName, adjacent.tomorrowIsRest)
              ? "Rest day"
              : adjacent.tomorrowName}
          </Text>
        </View>
      </View>
    </View>
  </SectionCard>
);
