import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { type ReactNode, useCallback } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Bottom-anchored panel rendered by gorhom, hosted in a native window.
 * gorhom's own modal paints underneath expo-router's native screen stack on
 * Android, and a dynamic-sized sheet with a scroll view never opened at all,
 * so the sheet uses a fixed snap point inside a transparent Modal.
 */
export const Sheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: SheetProps) => {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const { height } = useWindowDimensions();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Gestures inside a native Modal need their own handler root. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          index={0}
          snapPoints={[Math.round(height * 0.85)]}
          enablePanDownToClose
          onClose={onClose}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
          keyboardBehavior="interactive"
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-xl font-extrabold">{title}</Text>
            {subtitle != null && (
              <Text className="mt-1 text-sm text-muted-foreground">
                {subtitle}
              </Text>
            )}
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
};
