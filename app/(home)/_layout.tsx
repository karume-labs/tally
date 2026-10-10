import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useUniwind } from "uniwind";
import { NAV_THEME } from "@/lib/theme";

export default function HomeLayout() {
  const { theme } = useUniwind();

  return (
    <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack />
    </ThemeProvider>
  );
}
