import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({
  title,
  action,
  children,
  className,
}: SectionCardProps) => (
  <View
    className={cn("rounded-3xl border border-border bg-card p-5", className)}
  >
    {(title != null || action != null) && (
      <View className="mb-4 flex-row items-center justify-between gap-2">
        {title != null && (
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </Text>
        )}
        {action}
      </View>
    )}
    {children}
  </View>
);
