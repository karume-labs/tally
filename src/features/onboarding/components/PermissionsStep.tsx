import { Bell, Check, MicOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  notificationsGranted,
  permissionRows,
  requestPermissions,
} from "@/features/onboarding/services/permissions";

interface PermissionsStepProps {
  onDone: () => void;
}

/**
 * One permission, asked after the tour rather than before it: nobody grants a
 * notification prompt for an app they have not seen yet.
 */
export const PermissionsStep = ({ onDone }: PermissionsStepProps) => {
  const [granted, setGranted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    notificationsGranted().then(setGranted);
  }, []);

  const request = async () => {
    setBusy(true);
    try {
      setGranted(await requestPermissions());
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 justify-center gap-6 px-7">
      <View className="items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary">
          <Icon as={Bell} className="text-primary-foreground" size={36} />
        </View>
        <Text className="text-center text-3xl font-black tracking-tight">
          Two permissions. That's it.
        </Text>
        <Text className="text-center text-sm leading-5 text-muted-foreground">
          Tally has no account and no server. It only asks for what happens on
          this phone.
        </Text>
      </View>

      <View className="gap-3 rounded-3xl border border-border bg-card p-5">
        {permissionRows(granted).map((row) => (
          <View key={row.key} className="flex-row items-start gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Icon as={Bell} className="text-primary" size={18} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold">{row.label}</Text>
              <Text className="text-xs leading-4 text-muted-foreground">
                {row.why}
              </Text>
            </View>
            {row.granted ? (
              <Icon as={Check} className="text-primary" size={18} />
            ) : (
              <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Not yet
              </Text>
            )}
          </View>
        ))}

        <View className="flex-row items-start gap-3 border-t border-border pt-3">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <Icon as={MicOff} className="text-muted-foreground" size={18} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold">Nothing else</Text>
            <Text className="text-xs leading-4 text-muted-foreground">
              No contacts, no location, no microphone, no health data.
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <ActionButton
          size="lg"
          label={
            granted ? "Continue" : busy ? "Asking…" : "Allow notifications"
          }
          disabled={busy}
          onPress={granted ? onDone : request}
        />
        <ActionButton variant="ghost" label="Maybe later" onPress={onDone} />
      </View>
    </View>
  );
};
