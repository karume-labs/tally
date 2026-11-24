import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
        <Text className="text-2xl font-extrabold">This screen is missing</Text>
        <Text className="text-center text-sm text-muted-foreground">
          The route you opened does not exist in Tally.
        </Text>
        <Link href="/">
          <Text className="text-base font-semibold text-primary">
            Go to home
          </Text>
        </Link>
      </View>
    </>
  );
}
