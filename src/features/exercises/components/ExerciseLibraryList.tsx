import { Pencil } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { LibraryExercise } from "@/features/exercises/types";

interface ExerciseLibraryListProps {
  groups: Array<[string, LibraryExercise[]]>;
  onEdit: (exercise: LibraryExercise) => void;
}

export const ExerciseLibraryList = ({
  groups,
  onEdit,
}: ExerciseLibraryListProps) => (
  <>
    {groups.map(([group, rows]) => (
      <View key={group} className="gap-2 pb-4">
        <Text className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {group.replace("_", " ")}
        </Text>
        <View className="overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((exercise, index) => {
            const content = (
              <>
                <Text className="flex-1 text-[15px] font-semibold">
                  {exercise.name}
                </Text>
                {exercise.isCustom && (
                  <Icon
                    as={Pencil}
                    className="mx-2 text-muted-foreground"
                    size={14}
                  />
                )}
                <Text className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {exercise.equipment ?? "—"}
                </Text>
              </>
            );
            const rowClassName =
              index === rows.length - 1
                ? "flex-row items-center justify-between px-4 py-3"
                : "flex-row items-center justify-between border-b border-border px-4 py-3";

            return exercise.isCustom ? (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                className={`${rowClassName} active:bg-accent/40`}
                onPress={() => onEdit(exercise)}
              >
                {content}
              </Pressable>
            ) : (
              <View key={exercise.id} className={rowClassName}>
                {content}
              </View>
            );
          })}
        </View>
      </View>
    ))}
  </>
);
