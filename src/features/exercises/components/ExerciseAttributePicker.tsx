import { View } from "react-native";
import { OptionChip } from "@/components/shared/OptionChip";
import { Text } from "@/components/ui/text";
import { EQUIPMENT, type Equipment, MUSCLE_GROUPS } from "@/lib/constants";
import type { ExerciseDraft } from "../types";

const toRows = <T,>(items: readonly T[], perRow: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / perRow) }, (_, index) =>
    items.slice(index * perRow, index * perRow + perRow),
  );

interface ExerciseAttributePickerProps {
  muscleGroup: ExerciseDraft["muscleGroup"];
  equipment: Equipment | null;
  onMuscleGroupChange: (group: ExerciseDraft["muscleGroup"]) => void;
  onEquipmentChange: (equipment: Equipment | null) => void;
}

export const ExerciseAttributePicker = ({
  muscleGroup,
  equipment,
  onMuscleGroupChange,
  onEquipmentChange,
}: ExerciseAttributePickerProps) => (
  <>
    <View className="gap-2">
      <Text className="text-base font-semibold">Muscle group</Text>
      {toRows(MUSCLE_GROUPS, 4).map((row) => (
        <View key={row.join("-")} className="flex-row gap-2">
          {row.map((group) => (
            <OptionChip
              key={group}
              className="flex-1"
              label={group.replace("_", " ")}
              active={muscleGroup === group}
              onPress={() => onMuscleGroupChange(group)}
            />
          ))}
        </View>
      ))}
    </View>

    <View className="gap-2">
      <Text className="text-base font-semibold">Equipment</Text>
      {toRows(EQUIPMENT, 3).map((row) => (
        <View key={row.join("-")} className="flex-row gap-2">
          {row.map((item) => (
            <OptionChip
              key={item}
              className="flex-1"
              label={item}
              active={equipment === item}
              onPress={() => onEquipmentChange(item)}
            />
          ))}
        </View>
      ))}
      <OptionChip
        label="No equipment"
        active={equipment == null}
        onPress={() => onEquipmentChange(null)}
      />
    </View>
  </>
);
