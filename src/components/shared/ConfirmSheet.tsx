import { View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Sheet } from "@/components/shared/Sheet";
import { Text } from "@/components/ui/text";

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Omit to show a single dismiss button, e.g. for an error notice. */
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmation and error prompts belong to the app, not Android: a bottom sheet
 * keeps the same typography, colours and gesture handling as every other panel.
 */
export const ConfirmSheet = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmSheetProps) => (
  <Sheet visible={visible} onClose={onClose} title={title}>
    {message != null && (
      <Text className="mt-2 text-sm leading-5 text-muted-foreground">
        {message}
      </Text>
    )}
    <View className="mt-5 gap-2">
      {confirmLabel != null && (
        <ActionButton
          label={busy ? "Working…" : confirmLabel}
          variant={destructive ? "danger" : "primary"}
          disabled={busy}
          onPress={onConfirm}
        />
      )}
      <ActionButton
        label={cancelLabel}
        variant="secondary"
        disabled={busy}
        onPress={onClose}
      />
    </View>
  </Sheet>
);
