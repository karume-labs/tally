import { Plus } from "lucide-react-native";
import { TextInput, View } from "react-native";
import { ActionButton } from "@/components/shared/ActionButton";
import { Text } from "@/components/ui/text";

interface SetLoggerProps {
  weight: string;
  reps: string;
  rpe: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onLog: () => void;
  disabled?: boolean;
}

export const SetLogger = ({
  weight,
  reps,
  rpe,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onLog,
  disabled,
}: SetLoggerProps) => (
  <View className="mt-4 gap-3 border-t border-border pt-4">
    <View className="flex-row gap-2.5">
      <View className="flex-1 gap-1">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          kg
        </Text>
        <TextInput
          className="min-h-12 rounded-xl border border-border bg-secondary px-2 py-2 text-center text-base font-semibold text-foreground"
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#71717a"
          value={weight}
          onChangeText={onWeightChange}
          editable={!disabled}
        />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          reps
        </Text>
        <TextInput
          className="min-h-12 rounded-xl border border-border bg-secondary px-2 py-2 text-center text-base font-semibold text-foreground"
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#71717a"
          value={reps}
          onChangeText={onRepsChange}
          editable={!disabled}
        />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          rpe
        </Text>
        <TextInput
          className="min-h-12 rounded-xl border border-border bg-secondary px-2 py-2 text-center text-base font-semibold text-foreground"
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor="#71717a"
          value={rpe}
          onChangeText={onRpeChange}
          editable={!disabled}
        />
      </View>
    </View>
    <ActionButton
      icon={Plus}
      label="Log set"
      onPress={onLog}
      disabled={disabled}
    />
  </View>
);
