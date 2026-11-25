import { View } from "react-native";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatTile } from "@/components/shared/StatTile";
import { formatDuration, formatVolume } from "@/lib/utils";

interface SessionStatsCardProps {
  elapsed: number;
  totalVolume: number;
  completedSets: number;
}

export const SessionStatsCard = ({
  elapsed,
  totalVolume,
  completedSets,
}: SessionStatsCardProps) => (
  <SectionCard>
    <View className="flex-row">
      <StatTile label="Duration" value={formatDuration(elapsed)} />
      <StatTile label="Volume" value={formatVolume(totalVolume)} />
      <StatTile label="Sets" value={`${completedSets}`} />
    </View>
  </SectionCard>
);
