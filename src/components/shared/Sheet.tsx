import {
  BottomSheetModal,
  type BottomSheetModal as BottomSheetModalType,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { type ReactNode, useEffect, useRef } from "react";
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
 * Swipe-up sheet with no backdrop and no fade: the panel slides over the
 * screen and drags back down to dismiss, which is the motion gorhom gives for
 * free. Mounted once and presented imperatively so closing animates out.
 */
export const Sheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: SheetProps) => {
  const scheme = schemeFromTheme(useUniwind().theme);
  const colors = TALLY_THEME[scheme];
  const ref = useRef<BottomSheetModalType>(null);

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["55%", "90%"]}
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
    >
      <BottomSheetScrollView
        key={visible ? "open" : "closed"}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-extrabold">{title}</Text>
        {subtitle != null && (
          <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
        )}
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
