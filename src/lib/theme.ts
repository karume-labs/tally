import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router/react-navigation";

// ─── Tally palette ───────────────────────────────────────────────────────────────
export const TALLY_THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 3.9%)",
    primary: "hsl(20 94% 50%)", // flame orange
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(0 0% 96.1%)",
    secondaryForeground: "hsl(0 0% 9%)",
    muted: "hsl(0 0% 96.1%)",
    mutedForeground: "hsl(0 0% 45.1%)",
    accent: "hsl(20 94% 50%)",
    accentForeground: "hsl(0 0% 100%)",
    destructive: "hsl(0 84.2% 60.2%)",
    border: "hsl(0 0% 89.8%)",
    input: "hsl(0 0% 89.8%)",
    ring: "hsl(0 0% 63%)",
    radius: "0.625rem",
    chart1: "hsl(20 94% 50%)",
    chart2: "hsl(0 0% 3.9%)",
    chart3: "hsl(197 37% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 87% 67%)",
  },
  dark: {
    background: "hsl(0 0% 4%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(0 0% 7%)",
    cardForeground: "hsl(0 0% 98%)",
    popover: "hsl(0 0% 7%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(20 94% 55%)", // flame orange, brighter in dark
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(0 0% 14.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(0 0% 14.9%)",
    mutedForeground: "hsl(0 0% 63.9%)",
    accent: "hsl(20 94% 55%)",
    accentForeground: "hsl(0 0% 100%)",
    destructive: "hsl(0 70.9% 59.4%)",
    border: "hsl(0 0% 14.9%)",
    input: "hsl(0 0% 14.9%)",
    ring: "hsl(20 94% 55%)",
    radius: "0.625rem",
    chart1: "hsl(20 94% 55%)",
    chart2: "hsl(220 70% 50%)",
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(340 75% 55%)",
  },
} as const;

export type TallyTheme = typeof TALLY_THEME.light;

// ─── Navigation theme (used by the root layout) ──────────────────────────────────
// Re-publishes the nav theme so the root layout can keep importing from
// @/lib/theme without change. The root lib/theme.ts re-exports this whole file.
export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: TALLY_THEME.light.background,
      border: TALLY_THEME.light.border,
      card: TALLY_THEME.light.card,
      notification: TALLY_THEME.light.destructive,
      primary: TALLY_THEME.light.primary,
      text: TALLY_THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: TALLY_THEME.dark.background,
      border: TALLY_THEME.dark.border,
      card: TALLY_THEME.dark.card,
      notification: TALLY_THEME.dark.destructive,
      primary: TALLY_THEME.dark.primary,
      text: TALLY_THEME.dark.foreground,
    },
  },
};

// ─── Convenience getters ─────────────────────────────────────────────────────────
export function tallyColors(theme: "light" | "dark") {
  return TALLY_THEME[theme];
}

export const FLAME_ORANGE = "#ff6b35";
export const FLAME_ORANGE_DARK = "#ff8a5c";
export const STREAK_GREEN = "#22c55e";
export const MISSED_RED = "#ef4444";
export const REST_GRAY = "#6b7280";
