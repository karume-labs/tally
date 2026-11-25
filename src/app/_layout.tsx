import "@/global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";
import { initializeSchema } from "@/db/client";
import { seed } from "@/db/seed";
import { loadStreakRow } from "@/db/streak";
import { NAV_THEME, schemeFromTheme } from "@/lib/theme";
import { syncTodayWidget } from "@/services/sync-today-widget";
import { refreshWidgets } from "@/services/widget-refresh";
import { useStreakStore } from "@/stores/use-streak-store";

// Hold the native splash until the database is ready. Letting it hide on JS
// mount left a bare "Loading…" frame between the splash and the first screen.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or no native splash in this build.
});

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
    await syncTodayWidget();
    refreshWidgets();
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
      if (cancelled) return;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hidden from an effect so the first ready frame is mounted underneath it and
  // the splash crossfades straight into the app.
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        // Nothing to hide.
      });
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <BottomSheetModalProvider>
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
            <Stack.Screen
              name="about"
              options={{
                headerShown: true,
                title: "About",
                headerStyle: { backgroundColor: navTheme.colors.background },
                headerTintColor: navTheme.colors.text,
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: "800", fontSize: 20 },
              }}
            />
          </Stack>
          <PortalHost />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
