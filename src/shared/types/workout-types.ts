import type { Equipment, MuscleGroup } from "@/lib/constants";

export interface PrBest {
  bestWeight: number | null;
  bestReps: number | null;
  bestVolume: number | null;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment | null;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number;
  notes: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  completedAt: number | null;
  isPR: boolean;
}
