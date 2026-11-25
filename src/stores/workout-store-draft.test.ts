import { describe, expect, test } from "bun:test";
import type { WorkoutExercise, WorkoutSet } from "@/shared/types/workout-types";
import { applyLogSet } from "./workout-store-draft";
import { makeExercise, makeSnapshot } from "./workout-test-fixtures";

describe("workout-store-draft", () => {
  test("applyLogSet returns null when exerciseId is missing", () => {
    const result = applyLogSet(
      makeSnapshot([]),
      "missing",
      1,
      100,
      10,
      null,
      Date.now(),
    );
    expect(result).toBeNull();
  });

  test("applyLogSet detects a volume PR", () => {
    const existingSet: WorkoutSet = {
      setNumber: 1,
      weight: 100,
      reps: 5,
      rpe: null,
      completed: true,
      completedAt: Date.now() - 1000,
      isPR: false,
    };
    const exercises: WorkoutExercise[] = [makeExercise("ex1", [existingSet])];
    const prBest: Record<
      string,
      {
        bestWeight: number | null;
        bestReps: number | null;
        bestVolume: number | null;
      }
    > = {
      ex1: { bestWeight: 100, bestReps: 5, bestVolume: 500 },
    };

    const result = applyLogSet(
      {
        exercises,
        prBest,
        restTimerEndsAt: null,
        totalVolume: 0,
        completedSets: 0,
      },
      "ex1",
      2,
      100,
      6,
      null,
      Date.now(),
    );
    expect(result).not.toBeNull();
    expect(result?.newSet.isPR).toBe(true);
    expect(result?.prBest.ex1.bestVolume).toBe(600);
  });

  test("applyLogSet detects a weight PR at equal reps", () => {
    const exercises: WorkoutExercise[] = [makeExercise("ex1")];
    const prBest: Record<
      string,
      {
        bestWeight: number | null;
        bestReps: number | null;
        bestVolume: number | null;
      }
    > = {
      ex1: { bestWeight: 100, bestReps: 10, bestVolume: 1000 },
    };

    const result = applyLogSet(
      {
        exercises,
        prBest,
        restTimerEndsAt: null,
        totalVolume: 0,
        completedSets: 0,
      },
      "ex1",
      1,
      105,
      10,
      null,
      Date.now(),
    );
    expect(result?.newSet.isPR).toBe(true);
    expect(result?.prBest.ex1.bestWeight).toBe(105);
  });

  test("applyLogSet updates totals and sets restTimerEndsAt from restSeconds", () => {
    const before = Date.now();
    const result = applyLogSet(
      {
        exercises: [makeExercise("ex1", [], 90)],
        prBest: {},
        restTimerEndsAt: null,
        totalVolume: 0,
        completedSets: 0,
      },
      "ex1",
      1,
      100,
      10,
      null,
      before,
    );
    expect(result).not.toBeNull();
    expect(result?.newSet.completed).toBe(true);
    expect(result?.newSet.completedAt).toBe(before);
    expect(result?.restTimerEndsAt).toBe(before + 90 * 1000);
  });
});
