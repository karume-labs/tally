import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { AdjacentDays } from "@/db/split-days";

interface AdjacentDaysCardProps {
  adjacent: AdjacentDays;
}

const isRest = (name: string | null) =>
  name == null || name.toLowerCase() === "rest";

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
            {!isRest(adjacent.yesterdayName) &&
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
            {isRest(adjacent.tomorrowName) ? "Rest day" : adjacent.tomorrowName}
          </Text>
        </View>
      </View>
    </View>
  </SectionCard>
);
