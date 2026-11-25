import { useRouter } from "expo-router";
import { CalendarPlus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Sheet } from "@/components/shared/Sheet";
import { Text } from "@/components/ui/text";
import { listTrainableDays, type SplitDayOption } from "@/db/split-days";

interface StartRoutineButtonProps {
  label?: string;
  variant?: "primary" | "secondary";
}

/**
 * Skipping a day should not cost you the session. This lists every trainable
 * day in the active split so Tuesday's work can be done on Wednesday, and the
 * workout screen records it against the day that was actually picked.
 */
export const StartRoutineButton = ({
  label = "Train another day",
  variant = "secondary",
}: StartRoutineButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<SplitDayOption[]>([]);

  const openSheet = async () => {
    setDays(await listTrainableDays());
    setOpen(true);
  };

  const start = (dayId: string) => {
    setOpen(false);
    router.push({ pathname: "/workout", params: { dayId } });
  };

  return (
    <>
      <ActionButton
        icon={CalendarPlus}
        label={label}
        variant={variant}
        onPress={openSheet}
      />
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Pick a day"
        subtitle="Start any day of your split. The session is logged against the day you choose."
      >
        <View className="mt-4 gap-2">
          {days.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              This split has no trainable days yet.
            </Text>
          ) : (
            days.map((day) => (
              <Pressable
                key={day.id}
                accessibilityRole="button"
                onPress={() => start(day.id)}
                className="flex-row items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 active:opacity-80"
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-semibold">{day.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {day.exerciseCount} exercise
                    {day.exerciseCount === 1 ? "" : "s"}
                  </Text>
                </View>
                <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                  Start
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </Sheet>
    </>
  );
};
