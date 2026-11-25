import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { Text } from "@/components/ui/text";
import { deleteSplit, updateSplit } from "@/db/split-updates";
import { createSplit } from "@/db/splits";
import { SplitEditor } from "@/features/splits/components/SplitEditor";
import {
  loadSplitDraft,
  toSplitInput,
} from "@/features/splits/services/split-draft";
import type { SplitDraft } from "@/features/splits/types";
import { schemeFromTheme, TALLY_THEME } from "@/lib/theme";

const EMPTY_DRAFT: SplitDraft = {
  id: "",
  name: "",
  description: "",
  days: [{ name: "Day 1", isRestDay: false, exercises: [] }],
};

export default function SplitEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const colors = TALLY_THEME[schemeFromTheme(useUniwind().theme)];
  const isNew = id == null || id === "";
  const [draft, setDraft] = useState<SplitDraft | null>(
    isNew ? EMPTY_DRAFT : null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || id == null) return;
    let cancelled = false;
    loadSplitDraft(id).then((loaded) => {
      if (!cancelled) setDraft(loaded ?? EMPTY_DRAFT);
    });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const save = async (next: SplitDraft) => {
    if (saving || next.name.trim() === "") return;
    setSaving(true);
    try {
      const input = toSplitInput(next);
      if (isNew) {
        const created = await createSplit(input);
        router.replace({
          pathname: "/splits/[id]",
          params: { id: created },
        });
      } else if (id != null) {
        await updateSplit(id, input);
        router.back();
      }
    } catch (err) {
      Alert.alert(
        "Could not save",
        err instanceof Error ? err.message : "Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (id == null) return;
    Alert.alert("Delete this split?", "This cannot be undone.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSplit(id);
            router.replace("/splits");
          } catch (err) {
            Alert.alert(
              "Can't delete",
              err instanceof Error ? err.message : "Try again.",
            );
          }
        },
      },
    ]);
  };

  if (draft == null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-5 pb-24"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-sm text-muted-foreground">
        Days cycle across the week from Monday. Switch a day to rest to keep it
        as a recovery day — the name can be anything.
      </Text>
      <SplitEditor
        initial={draft}
        isNew={isNew}
        saving={saving}
        onSave={save}
        onDelete={isNew ? undefined : remove}
      />
    </ScrollView>
  );
}
