import { ConfirmSheet } from "@/components/shared/ConfirmSheet";

interface CancelSessionSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Leaving a live session throws away what was logged, so it asks first. */
export const CancelSessionSheet = ({
  visible,
  onConfirm,
  onClose,
}: CancelSessionSheetProps) => (
  <ConfirmSheet
    visible={visible}
    title="Cancel this session?"
    message="Nothing logged so far will be saved."
    confirmLabel="Cancel session"
    cancelLabel="Keep going"
    destructive
    onConfirm={onConfirm}
    onClose={onClose}
  />
);
