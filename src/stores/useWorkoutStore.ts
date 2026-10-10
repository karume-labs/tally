import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Equipment, MuscleGroup } from "@/lib/constants";
import { calculateVolume, checkSetPR } from "@/lib/utils";

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

interface WorkoutStore {
  // Session
  sessionId: string | null;
  splitDayId: string | null;
  splitDayName: string | null;
  startedAt: number | null;
  notes: string;

  // Exercises
  exercises: WorkoutExercise[];

  // Rest timer
  restTimerEndsAt: number | null;

  // PR tracking: exerciseId -> { bestWeight, bestReps, bestVolume }
  prBest: Record<
    string,
    {
      bestWeight: number | null;
      bestReps: number | null;
      bestVolume: number | null;
    }
  >;

  // Computed
  totalVolume: number;
  completedSets: number;
  isRestDay: boolean;

  // Actions
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

export const useWorkoutStore = create<WorkoutStore>()(
  devtools(
    (set, get) => ({
      sessionId: null,
      splitDayId: null,
      splitDayName: null,
      startedAt: null,
      notes: "",
      exercises: [],
      restTimerEndsAt: null,
      prBest: {},

      totalVolume: 0,
      completedSets: 0,
      isRestDay: false,

      startSession: (sessionId, splitDayId, splitDayName, startedAt) =>
        set({
          sessionId,
          splitDayId,
          splitDayName,
          startedAt,
          notes: "",
          exercises: [],
          restTimerEndsAt: null,
          prBest: {},
          totalVolume: 0,
          completedSets: 0,
        }),

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [...state.exercises, exercise],
          isRestDay: false,
        })),

      setSplitDayName: (name: string | null) =>
        set({
          splitDayName: name,
          isRestDay: name == null || name.toLowerCase() === "rest",
        }),

      updateExerciseNotes: (exerciseId, notes) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.exerciseId === exerciseId ? { ...e, notes } : e,
          ),
        })),

      logSet: (exerciseId, setNumber, weight, reps, rpe, completedAt) => {
        const state = get();
        const exercise = state.exercises.find(
          (e) => e.exerciseId === exerciseId,
        );
        if (!exercise) return null;

        const existing = exercise.sets.find((s) => s.setNumber === setNumber);
        const isNew = !existing;

        const best = state.prBest[exerciseId] ?? {
          bestWeight: null,
          bestReps: null,
          bestVolume: null,
        };

        const volume = calculateVolume(weight, reps);
        const prCheck = checkSetPR(
          weight,
          reps,
          best.bestWeight,
          best.bestReps,
          best.bestVolume,
        );
        const isPR = !!prCheck.isPR;

        const updatedBest = isPR
          ? {
              bestWeight:
                weight != null &&
                (best.bestWeight == null || weight > best.bestWeight)
                  ? weight
                  : best.bestWeight,
              bestReps:
                weight != null &&
                reps != null &&
                (best.bestReps == null ||
                  (weight === best.bestWeight && reps > best.bestReps) ||
                  (best.bestWeight == null && reps > best.bestReps))
                  ? reps
                  : best.bestReps,
              bestVolume:
                volume > (best.bestVolume ?? 0) ? volume : best.bestVolume,
            }
          : best;

        const newSet: WorkoutSet = {
          setNumber,
          weight,
          reps,
          rpe,
          completed: !!completedAt,
          completedAt,
          isPR,
        };

        const exercises = isNew
          ? [...state.exercises, { ...exercise, sets: [newSet] }]
          : state.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? { ...e, sets: [...e.sets, newSet] }
                : e,
            );

        // Update the PR best for future comparisons within this session.
        const prBest = {
          ...state.prBest,
          [exerciseId]: updatedBest,
        };

        // Recompute totals.
        let totalVolume = 0;
        let completedSets = 0;
        for (const ex of exercises) {
          for (const s of ex.sets) {
            if (s.completed && s.weight != null && s.reps != null) {
              totalVolume += s.weight * s.reps;
              completedSets++;
            }
          }
        }

        set({
          exercises,
          prBest,
          totalVolume,
          completedSets,
          // If this set was logged with a completedAt, also treat it as completed.
          restTimerEndsAt:
            completedAt != null && exercise.restSeconds > 0
              ? completedAt + exercise.restSeconds * 1000
              : state.restTimerEndsAt,
        });

        return newSet;
      },

      completeSet: (exerciseId, setNumber) => {
        const state = get();
        const exercise = state.exercises.find(
          (e) => e.exerciseId === exerciseId,
        );
        if (!exercise) return;
        const now = Date.now();
        set((state) => {
          const exercises = state.exercises.map((e) =>
            e.exerciseId === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.setNumber === setNumber
                      ? {
                          ...s,
                          completed: true,
                          completedAt: now,
                          isPR: s.isPR,
                        }
                      : s,
                  ),
                }
              : e,
          );
          let totalVolume = 0;
          let completedSets = 0;
          for (const ex of exercises) {
            for (const s of ex.sets) {
              if (s.completed && s.weight != null && s.reps != null) {
                totalVolume += s.weight * s.reps;
                completedSets++;
              }
            }
          }
          return {
            exercises,
            totalVolume,
            completedSets,
            restTimerEndsAt:
              exercise.restSeconds > 0
                ? now + exercise.restSeconds * 1000
                : null,
          };
        });
      },

      skipRest: () => set({ restTimerEndsAt: null }),
      setRestTimer: (endsAt) => set({ restTimerEndsAt: endsAt }),

      updateNotes: (notes) => set({ notes }),

      finishSession: () => {
        const state = get();
        const startedAt = state.startedAt ?? Date.now();
        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
        const prCount = state.exercises.reduce(
          (acc, ex) => acc + ex.sets.filter((s) => s.isPR).length,
          0,
        );
        const setLogs = state.exercises.flatMap((ex) =>
          ex.sets.map((s) => ({ exerciseId: ex.exerciseId, ...s })),
        );
        return {
          durationSeconds,
          totalVolume: state.totalVolume,
          completedSets: state.completedSets,
          prCount,
          setLogs,
        };
      },

      reset: () =>
        set({
          sessionId: null,
          splitDayId: null,
          splitDayName: null,
          startedAt: null,
          notes: "",
          exercises: [],
          restTimerEndsAt: null,
          prBest: {},
          totalVolume: 0,
          completedSets: 0,
        }),
    }),
    { name: "workout" },
  ),
);
