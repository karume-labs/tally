import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  className?: string;
}

export const StatTile = ({ label, value, className }: StatTileProps) => (
  <View className={cn("flex-1 items-center gap-1.5", className)}>
    <Text className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </Text>
    <Text className="text-2xl font-black tabular-nums text-foreground">
      {value}
    </Text>
  </View>
);
