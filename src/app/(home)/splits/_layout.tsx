import { Stack } from "expo-router";
import { useUniwind } from "uniwind";
import { NAV_THEME, schemeFromTheme } from "@/lib/theme";

export default function SplitsLayout() {
  const { theme } = useUniwind();
  const navTheme = NAV_THEME[schemeFromTheme(theme)];

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: navTheme.colors.background },
        headerTintColor: navTheme.colors.text,
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        contentStyle: { backgroundColor: navTheme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Splits" }} />
      <Stack.Screen
        name="[id]"
        options={{ title: "Split", headerBackTitle: "Splits" }}
      />
    </Stack>
  );
}
