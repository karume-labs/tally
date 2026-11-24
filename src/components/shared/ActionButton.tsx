import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type ActionButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  variant?: ActionButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

const BASE =
  "flex-row items-center justify-center gap-2.5 rounded-xl active:opacity-90";

const SIZES = {
  sm: "min-h-10 px-4 gap-2",
  md: "min-h-12 px-5",
  lg: "min-h-14 px-6 gap-3",
} as const;

const LABEL_SIZES = {
  sm: "text-xs",
  md: "text-[13px]",
  lg: "text-sm",
} as const;

const ICON_BOXES = {
  sm: "h-6 w-6 rounded-md",
  md: "h-7 w-7 rounded-lg",
  lg: "h-8 w-8 rounded-lg",
} as const;

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

// A solid bottom edge gives the pressable a physical, arcade-panel feel without
// gradients or shadows, which the design rules rule out.
const VARIANTS: Record<ActionButtonVariant, string> = {
  primary: "bg-primary border-b-4 border-black/25",
  secondary: "bg-secondary border border-border border-b-4 border-b-black/20",
  outline: "border border-border bg-card active:bg-accent",
  ghost: "active:bg-accent/60",
  danger: "bg-destructive border-b-4 border-black/25",
};

const LABEL_TONES: Record<ActionButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-muted-foreground",
  danger: "text-destructive-foreground",
};

const ICON_CHIPS: Record<ActionButtonVariant, string> = {
  primary: "bg-black/15",
  secondary: "bg-black/10",
  outline: "bg-foreground/10",
  ghost: "bg-transparent",
  danger: "bg-black/20",
};

export const ActionButton = ({
  label,
  icon: IconComponent,
  variant = "primary",
  size = "md",
  disabled = false,
  onPress,
  className,
}: ActionButtonProps) => {
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const iconColor =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : variant === "danger"
          ? colors.destructiveForeground
          : variant === "ghost"
            ? colors.mutedForeground
            : colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        BASE,
        SIZES[size],
        VARIANTS[variant],
        disabled && "opacity-40",
        className,
      )}
    >
      {IconComponent != null && (
        <View
          className={cn(
            "items-center justify-center",
            ICON_BOXES[size],
            ICON_CHIPS[variant],
          )}
        >
          <IconComponent size={ICON_SIZE[size]} color={iconColor} />
        </View>
      )}
      <Text
        className={cn(
          "font-bold uppercase tracking-wider",
          LABEL_SIZES[size],
          LABEL_TONES[variant],
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
};
