import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { WorkoutStore } from "./workout-store";
import type { WorkoutSnapshot } from "./workout-store-draft";
import { applyCompleteSet, applyLogSet } from "./workout-store-draft";
import { buildFinishResult } from "./workout-store-finish";

export const useWorkoutStore = create<WorkoutStore>()(
  devtools(
    (set, get) => {
      return {
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
            isRestDay: false,
          }),

        // Fast Refresh and a screen remount keep the in-memory session but reset
        // the loader effect, which used to append the whole plan a second time.
        addExercise: (exercise) =>
          set((state) =>
            state.exercises.some((e) => e.exerciseId === exercise.exerciseId)
              ? state
              : {
                  exercises: [...state.exercises, exercise],
                  isRestDay: false,
                },
          ),

        updateExerciseNotes: (exerciseId, notes) =>
          set((state) => ({
            exercises: state.exercises.map((e) =>
              e.exerciseId === exerciseId ? { ...e, notes } : e,
            ),
          })),

        logSet: (exerciseId, setNumber, weight, reps, rpe, completedAt) => {
          const applied = applyLogSet(
            get() as WorkoutSnapshot,
            exerciseId,
            setNumber,
            weight,
            reps,
            rpe,
            completedAt,
          );
          if (!applied) return null;
          set({
            exercises: applied.exercises,
            prBest: applied.prBest,
            totalVolume: applied.totalVolume,
            completedSets: applied.completedSets,
            restTimerEndsAt: applied.restTimerEndsAt,
          });
          return applied.newSet;
        },

        completeSet: (exerciseId, setNumber) => {
          const applied = applyCompleteSet(
            get() as WorkoutSnapshot,
            exerciseId,
            setNumber,
          );
          if (!applied) return;
          set({
            exercises: applied.exercises,
            totalVolume: applied.totalVolume,
            completedSets: applied.completedSets,
            restTimerEndsAt: applied.restTimerEndsAt,
          });
        },

        skipRest: () => set({ restTimerEndsAt: null }),
        setRestTimer: (endsAt) => set({ restTimerEndsAt: endsAt }),

        updateNotes: (notes) => set({ notes }),

        finishSession: () =>
          buildFinishResult(get() as WorkoutSnapshot, get().startedAt),

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
            isRestDay: false,
          }),
      };
    },
    { name: "workout" },
  ),
);
