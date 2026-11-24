import { Image } from "react-native";
import { cn } from "@/lib/utils";

interface TallyLogoProps {
  size?: number;
  className?: string;
}

// The launcher icons are generated from this same mark (app.json), so in-app
// branding and the home-screen icon never drift apart.
export const TallyLogo = ({ size = 40, className }: TallyLogoProps) => (
  <Image
    accessibilityIgnoresInvertColors
    accessibilityLabel="Tally"
    source={require("../../../assets/images/icon.png")}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
    }}
    className={cn("bg-primary", className)}
  />
);
