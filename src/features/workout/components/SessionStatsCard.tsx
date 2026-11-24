import { X } from "lucide-react-native";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatTile } from "@/components/shared/StatTile";
import { formatDuration, formatVolume } from "@/lib/utils";

interface SessionStatsCardProps {
  elapsed: number;
  totalVolume: number;
  completedSets: number;
  hasSession: boolean;
  onCancel: () => void;
}

export const SessionStatsCard = ({
  elapsed,
  totalVolume,
  completedSets,
  hasSession,
  onCancel,
}: SessionStatsCardProps) => (
  <SectionCard>
    <View className="flex-row">
      <StatTile label="Duration" value={formatDuration(elapsed)} />
      <StatTile label="Volume" value={formatVolume(totalVolume)} />
      <StatTile label="Sets" value={`${completedSets}`} />
    </View>
    {hasSession && (
      <ActionButton
        variant="ghost"
        size="sm"
        icon={X}
        className="mt-4 self-start"
        label="Cancel session"
        onPress={onCancel}
      />
    )}
  </SectionCard>
);
