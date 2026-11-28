import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Bottom-anchored panel presented in a native Modal. The gorhom bottom sheet
 * this replaced accepted taps but painted nothing on device, which made every
 * picker invisible.
 */
export const Sheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: SheetProps) => {
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="flex-1"
          onPress={onClose}
        />
        <View
          className="rounded-t-3xl border border-b-0 border-border bg-card"
          style={{ maxHeight: height * 0.9 }}
        >
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </View>
          <ScrollView
            contentContainerClassName="px-5 pb-10"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-xl font-extrabold">{title}</Text>
            {subtitle != null && (
              <Text className="mt-1 text-sm text-muted-foreground">
                {subtitle}
              </Text>
            )}
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
