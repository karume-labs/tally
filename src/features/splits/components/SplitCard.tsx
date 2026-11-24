import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface SplitCardProps {
  name: string;
  description?: string | null;
  isActive: boolean;
  dayCount?: number;
  onPress: () => void;
}

export const SplitCard = ({
  name,
  description,
  isActive,
  dayCount,
  onPress,
}: SplitCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className={
      isActive
        ? "flex-row items-center gap-3 rounded-3xl border-2 border-primary bg-card p-5 active:opacity-90"
        : "flex-row items-center gap-3 rounded-3xl border border-border bg-card p-5 active:opacity-90"
    }
  >
    <View className="flex-1 gap-1.5">
      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-bold">{name}</Text>
        {isActive && (
          <Text className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Active
          </Text>
        )}
      </View>
      {description != null && description !== "" && (
        <Text className="text-sm text-muted-foreground" numberOfLines={2}>
          {description}
        </Text>
      )}
      {dayCount != null && (
        <Text className="text-xs text-muted-foreground">
          {dayCount} day plan{dayCount === 1 ? "" : "s"}
        </Text>
      )}
    </View>
    <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
  </Pressable>
);
