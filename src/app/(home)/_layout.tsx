import { Redirect, Tabs } from "expo-router";
import { Dumbbell, Flame, House, Layers, Settings } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import {
  NAV_THEME,
  schemeFromTheme,
  TALLY_THEME,
  type TallyTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

const TAB_ICON_SIZE = 21;

interface TabIconProps {
  icon: typeof House;
  focused: boolean;
  colors: TallyTheme;
}

// The active tab gets a pill behind its icon so the bar reads as a game HUD
// rather than a flat strip of glyphs.
const TabIcon = ({ icon: IconComponent, focused, colors }: TabIconProps) => (
  <View
    className={cn(
      "h-8 w-12 items-center justify-center rounded-xl",
      focused && "bg-primary/15",
    )}
  >
    <IconComponent
      color={focused ? colors.primary : colors.mutedForeground}
      size={TAB_ICON_SIZE}
    />
  </View>
);

export default function HomeTabsLayout() {
  const { theme } = useUniwind();
  const scheme = schemeFromTheme(theme);
  const navTheme = NAV_THEME[scheme];
  const colors = TALLY_THEME[scheme];
  const insets = useSafeAreaInsets();
  const onboarded = useSettingsStore((state) => state.settings.onboarded);

  // First run never reaches the tabs: onboarding owns the screen until it has
  // been finished or skipped.
  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: navTheme.colors.background },
        headerTintColor: navTheme.colors.text,
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        tabBarStyle: {
          backgroundColor: navTheme.colors.background,
          borderTopColor: navTheme.colors.border,
          height: 62 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
        },
        tabBarActiveTintColor: navTheme.colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tally",
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon colors={colors} icon={House} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabIcon colors={colors} icon={Dumbbell} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="splits"
        options={{
          title: "Splits",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon colors={colors} icon={Layers} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "Streak",
          tabBarIcon: ({ focused }) => (
            <TabIcon colors={colors} icon={Flame} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon colors={colors} icon={Settings} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
