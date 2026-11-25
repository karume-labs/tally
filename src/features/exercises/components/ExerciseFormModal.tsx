import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { Sheet } from "@/components/shared/Sheet";
import { Text } from "@/components/ui/text";
import type {
  ExerciseDraft,
  LibraryExercise,
} from "@/features/exercises/types";
import type { Equipment } from "@/lib/constants";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
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
    <Sheet
      visible
      onClose={onClose}
      title={initial == null ? "New exercise" : "Edit exercise"}
    >
      <View className="mt-4 gap-4">
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
          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            disabled={busy}
            className="flex-row items-center justify-center gap-2 py-2 active:opacity-70"
          >
            <Trash2 color={colors.mutedForeground} size={16} />
            <Text className="text-sm font-semibold text-muted-foreground">
              Delete exercise
            </Text>
          </Pressable>
        )}
      </View>
    </Sheet>
  );
};
