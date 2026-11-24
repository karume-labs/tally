import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Modal, Pressable, TextInput, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";
import type { Equipment } from "@/lib/constants";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import type { ExerciseDraft, LibraryExercise } from "../types";
import { ExerciseAttributePicker } from "./ExerciseAttributePicker";

interface ExerciseFormModalProps {
  /** null creates a new custom exercise. */
  initial: LibraryExercise | null;
  onClose: () => void;
  onSave: (draft: ExerciseDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ExerciseFormModal = ({
  initial,
  onClose,
  onSave,
  onDelete,
}: ExerciseFormModalProps) => {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const [name, setName] = useState(initial?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState<ExerciseDraft["muscleGroup"]>(
    (initial?.muscleGroup ?? "chest") as ExerciseDraft["muscleGroup"],
  );
  const [equipment, setEquipment] = useState<Equipment | null>(
    (initial?.equipment ?? null) as Equipment | null,
  );
  const [busy, setBusy] = useState(false);

  const canSave = name.trim() !== "" && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      await onSave({
        id: initial?.id ?? null,
        name: name.trim(),
        muscleGroup,
        equipment,
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (initial == null) return;
    Alert.alert(
      "Delete exercise?",
      `"${initial.name}" will be removed from your library.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setBusy(true);
            onDelete(initial.id)
              .catch((err: unknown) => {
                Alert.alert(
                  "Can't delete",
                  err instanceof Error ? err.message : "Try again.",
                );
              })
              .finally(() => setBusy(false));
          },
        },
      ],
    );
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="gap-4 rounded-t-3xl border border-border bg-card p-5 pb-8">
          <Text className="text-xl font-extrabold">
            {initial == null ? "New exercise" : "Edit exercise"}
          </Text>

          <View className="gap-2">
            <Text className="text-base font-semibold">Name</Text>
            <TextInput
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground"
              placeholder="e.g. Incline dumbbell press"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus={initial == null}
              autoCorrect={false}
            />
          </View>

          <ExerciseAttributePicker
            muscleGroup={muscleGroup}
            equipment={equipment}
            onMuscleGroupChange={setMuscleGroup}
            onEquipmentChange={setEquipment}
          />

          <ActionButton
            label={initial == null ? "Add exercise" : "Save changes"}
            disabled={!canSave}
            onPress={save}
          />
          {initial != null && (
            <ActionButton
              icon={Trash2}
              label="Delete exercise"
              variant="danger"
              disabled={busy}
              onPress={confirmDelete}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
