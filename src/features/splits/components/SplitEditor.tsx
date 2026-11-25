import { Plus } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useUniwind } from "uniwind";
import { ActionButton } from "@/components/shared/ActionButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Text } from "@/components/ui/text";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";
import { useSettingsStore } from "@/stores/use-settings-store";
import type { DraftDay, SplitDraft } from "../types";
import { SplitDayEditor } from "./SplitDayEditor";

interface SplitEditorProps {
  initial: SplitDraft;
  isNew: boolean;
  saving: boolean;
  onSave: (draft: SplitDraft) => void;
  onDelete?: () => void;
}

const newDay = (index: number): DraftDay => ({
  name: `Day ${index + 1}`,
  isRestDay: false,
  exercises: [],
});

export const SplitEditor = ({
  initial,
  isNew,
  saving,
  onSave,
  onDelete,
}: SplitEditorProps) => {
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const defaultRestSeconds = useSettingsStore(
    (state) => state.settings.defaultRestSeconds,
  );
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [days, setDays] = useState<DraftDay[]>(initial.days);

  const updateDay = (index: number, day: DraftDay) =>
    setDays((current) => current.map((row, i) => (i === index ? day : row)));

  const canSave = name.trim() !== "" && days.length > 0 && !saving;

  return (
    <View className="gap-4">
      <SectionCard title={isNew ? "New split" : "Split details"}>
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Name
          </Text>
          <TextInput
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base font-semibold text-foreground"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Upper / Lower"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View className="mt-4 gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </Text>
          <TextInput
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            value={description}
            onChangeText={setDescription}
            placeholder="What this split is for"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Days"
        action={
          <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {days.length} day{days.length === 1 ? "" : "s"}
          </Text>
        }
      >
        <View className="gap-3">
          {days.map((day, index) => (
            <SplitDayEditor
              key={day.id ?? `new-${index}`}
              day={day}
              index={index}
              defaultRestSeconds={defaultRestSeconds}
              onChange={(next) => updateDay(index, next)}
              onRemove={() =>
                setDays((current) => current.filter((_, i) => i !== index))
              }
            />
          ))}
          <ActionButton
            icon={Plus}
            variant="secondary"
            label="Add day"
            onPress={() =>
              setDays((current) => [...current, newDay(current.length)])
            }
          />
        </View>
      </SectionCard>

      <ActionButton
        size="lg"
        label={saving ? "Saving…" : isNew ? "Create split" : "Save changes"}
        disabled={!canSave}
        onPress={() => onSave({ ...initial, name, description, days })}
      />
      {!isNew && onDelete != null && (
        <ActionButton
          variant="danger"
          label="Delete split"
          disabled={saving}
          onPress={onDelete}
        />
      )}
    </View>
  );
};
