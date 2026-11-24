import type { Equipment, MuscleGroup } from "@/lib/constants";

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  isCustom: boolean;
}

export interface ExerciseDraft {
  id: string | null;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment | null;
}
