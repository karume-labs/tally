import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router/react-navigation";

// ─── Tally palette ───────────────────────────────────────────────────────────────
// Mirrors the tokens in src/global.css. Native chrome (headers, tab bars) and
// native-only style objects read from here; component styling uses className
// tokens so the CSS file stays the single source of truth.
export const TALLY_THEME = {
  light: {
    background: "#fff9e4",
    foreground: "#141414",
    card: "#ffffff",
    cardForeground: "#141414",
    popover: "#ffffff",
    popoverForeground: "#141414",
    primary: "#ffd340",
    primaryForeground: "#141414",
    secondary: "#f6ebc5",
    secondaryForeground: "#141414",
    muted: "#f6ebc5",
    mutedForeground: "#6a6249",
    accent: "#ffefb3",
    accentForeground: "#141414",
    destructive: "#b42318",
    destructiveForeground: "#fff5f5",
    border: "#e5d9ae",
    input: "#e5d9ae",
    ring: "#c79a00",
    success: "#556f1f",
  },
  dark: {
    background: "#101113",
    foreground: "#f7f5ed",
    card: "#1a1c20",
    cardForeground: "#f7f5ed",
    popover: "#212328",
    popoverForeground: "#f7f5ed",
    primary: "#ffd340",
    primaryForeground: "#141414",
    secondary: "#26282e",
    secondaryForeground: "#f7f5ed",
    muted: "#212328",
    mutedForeground: "#a9abb4",
    accent: "#3a3213",
    accentForeground: "#fff2c4",
    destructive: "#f87171",
    destructiveForeground: "#1a0f0f",
    border: "#3a3d45",
    input: "#3a3d45",
    ring: "#ffd340",
    success: "#c9db74",
  },
} as const;

export type ThemeScheme = keyof typeof TALLY_THEME;
// A palette from either scheme; consumers read tokens, not literal hex types.
export type TallyTheme = (typeof TALLY_THEME)[ThemeScheme];

export const schemeFromTheme = (theme: string | undefined): ThemeScheme =>
  theme === "dark" ? "dark" : "light";

// ─── Navigation theme ────────────────────────────────────────────────────────────
// Header and tab-bar backgrounds use the page background so the chrome reads as
// one surface instead of a lighter band above every screen.
export const NAV_THEME: Record<ThemeScheme, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: TALLY_THEME.light.background,
      border: TALLY_THEME.light.border,
      card: TALLY_THEME.light.background,
      notification: TALLY_THEME.light.destructive,
      primary: TALLY_THEME.light.primary,
      text: TALLY_THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: TALLY_THEME.dark.background,
      border: TALLY_THEME.dark.border,
      card: TALLY_THEME.dark.background,
      notification: TALLY_THEME.dark.destructive,
      primary: TALLY_THEME.dark.primary,
      text: TALLY_THEME.dark.foreground,
    },
  },
};

// ─── Convenience getters ─────────────────────────────────────────────────────────
export const tallyColors = (scheme: ThemeScheme) => TALLY_THEME[scheme];

// Straight from the app mark, for icon props that cannot take a className token.
export const BRAND_YELLOW = "#ffd340";
export const BRAND_INK = "#121418";
export const STREAK_GREEN = "#c9db74";
export const MISSED_RED = "#f87171";
export const REST_GRAY = "#a9abb4";
