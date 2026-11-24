import { Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface OptionChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  className?: string;
}

export const OptionChip = ({
  label,
  active,
  onPress,
  className,
}: OptionChipProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    className={cn(
      "min-h-11 items-center justify-center rounded-xl border-2 px-3 py-2 active:opacity-80",
      active ? "border-primary bg-primary" : "border-border bg-secondary",
      className,
    )}
  >
    <Text
      className={cn(
        "text-sm font-bold",
        active ? "text-primary-foreground" : "text-muted-foreground",
      )}
    >
      {label}
    </Text>
  </Pressable>
);
