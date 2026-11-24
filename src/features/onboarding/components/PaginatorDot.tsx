import { View } from "react-native";
import { cn } from "@/lib/utils";

interface PaginatorDotProps {
  active: boolean;
}

export const PaginatorDot = ({ active }: PaginatorDotProps) => (
  <View
    className={cn(
      "h-2 rounded-full",
      active ? "w-6 bg-primary" : "w-2 bg-border",
    )}
  />
);
