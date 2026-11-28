import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";
import { ConfirmSheet } from "@/components/shared/ConfirmSheet";
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
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
    setError(null);
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
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (id == null) return;
    setSaving(true);
    try {
      await deleteSplit(id);
      setConfirmingDelete(false);
      router.replace("/splits");
    } catch (err) {
      setConfirmingDelete(false);
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (draft == null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-5 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-muted-foreground">
          Days cycle across the week from Monday. Switch a day to rest to keep
          it as a recovery day — the name can be anything.
        </Text>
        {error != null && (
          <Text className="text-sm font-semibold text-destructive">
            {error}
          </Text>
        )}
        <SplitEditor
          initial={draft}
          isNew={isNew}
          saving={saving}
          onSave={save}
          onDelete={isNew ? undefined : () => setConfirmingDelete(true)}
        />
      </ScrollView>

      <ConfirmSheet
        visible={confirmingDelete}
        title="Delete this split?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={saving}
        onConfirm={remove}
        onClose={() => setConfirmingDelete(false)}
      />
    </>
  );
}
