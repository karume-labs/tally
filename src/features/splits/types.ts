import type { MuscleGroup } from "@/lib/constants";

export interface SplitScheduleEntry {
  name: string;
  isRestDay: boolean;
  exercises: string[];
}

export interface SplitExport {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  schedule: string;
}

export interface SplitWithDays extends SplitExport {
  days: SplitDayExport[];
}

export interface SplitDayPlan {
  id: string;
  name: string;
  isRestDay: boolean | null;
  exerciseCount: number;
}

export interface SplitDayExport {
  id: string;
  name: string;
  dayOrder: number;
  isRestDay: boolean;
}

export interface SplitDayExerciseExport {
  id: string;
  order: number;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    equipment: string | null;
  };
}
