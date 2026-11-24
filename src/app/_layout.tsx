import "@/global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";
import { initializeSchema } from "@/db/client";
import { seed } from "@/db/seed";
import { loadStreakRow } from "@/db/streak";
import { NAV_THEME, schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { useStreakStore } from "@/stores/use-streak-store";
import { WidgetTaskHandler } from "@/widgets/widget-task-handler";

if (Platform.OS === "android") {
  try {
    const widgetMod = require("react-native-android-widget");
    widgetMod?.registerWidgetTaskHandler?.(WidgetTaskHandler);
  } catch {
    // Widget registration is unavailable on this build/configuration.
  }
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

let bootstrapped = false;

// Fresh installs have an empty database, so schema creation, seed data and the
// persisted streak row all have to be ready before the first screen queries it.
const bootstrap = async () => {
  if (bootstrapped) return;
  try {
    await initializeSchema();
    await seed();
    const row = await loadStreakRow();
    if (row) {
      useStreakStore.getState().setRow(row);
      useStreakStore.getState().refreshMilestones();
    }
    bootstrapped = true;
  } catch (err) {
    // Leave the flag false so a later attempt can retry a failed boot.
    console.warn("[tally.boot] bootstrap failed:", err);
  }
};

export default function RootLayout() {
  const { theme } = useUniwind();
  const scheme = schemeFromTheme(theme);
  const navTheme = NAV_THEME[scheme];
  const [ready, setReady] = useState(bootstrapped);

  useEffect(() => {
    let cancelled = false;
    bootstrap().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {ready ? (
        <>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: navTheme.colors.background },
            }}
          >
            {/* Lives above the tabs on purpose: it is reached from Home and
                Settings, not from a tab, so showing the tab bar left every tab
                looking unselected. Pennywise routes its Debts screen the same way. */}
            <Stack.Screen
              name="exercises"
              options={{
                headerShown: true,
                title: "Exercises",
                headerStyle: { backgroundColor: navTheme.colors.background },
                headerTintColor: navTheme.colors.text,
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: "800", fontSize: 20 },
              }}
            />
          </Stack>
          <PortalHost />
        </>
      ) : (
        <View className="flex-1 items-center justify-center gap-3 bg-background">
          <ActivityIndicator color={TALLY_THEME[scheme].primary} />
          <Text className="text-sm text-muted-foreground">
            Preparing your training log…
          </Text>
        </View>
      )}
    </ThemeProvider>
  );
}
