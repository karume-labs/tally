import type {
  PrBest,
  WorkoutExercise,
  WorkoutSet,
} from "@/shared/types/workout-types";

export type {
  PrBest,
  WorkoutExercise,
  WorkoutSet,
} from "@/shared/types/workout-types";

export interface WorkoutStore {
  sessionId: string | null;
  splitDayId: string | null;
  splitDayName: string | null;
  startedAt: number | null;
  notes: string;
  exercises: WorkoutExercise[];
  restTimerEndsAt: number | null;
  prBest: Record<string, PrBest>;
  totalVolume: number;
  completedSets: number;
  isRestDay: boolean;
  startSession: (
    sessionId: string,
    splitDayId: string | null,
    splitDayName: string | null,
    startedAt: number,
  ) => void;
  addExercise: (exercise: WorkoutExercise) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
  logSet: (
    exerciseId: string,
    setNumber: number,
    weight: number | null,
    reps: number | null,
    rpe: number | null,
    completedAt: number,
  ) => WorkoutSet | null;
  completeSet: (exerciseId: string, setNumber: number) => void;
  skipRest: () => void;
  setRestTimer: (endsAt: number | null) => void;
  updateNotes: (notes: string) => void;
  finishSession: () => {
    durationSeconds: number;
    totalVolume: number;
    completedSets: number;
    prCount: number;
    setLogs: WorkoutSet[];
  };
  reset: () => void;
}
