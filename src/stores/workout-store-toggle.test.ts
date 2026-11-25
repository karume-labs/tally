import { describe, expect, test } from "bun:test";
import type { WorkoutExercise } from "@/shared/types/workout-types";
import { applyToggleSet } from "./workout-store-draft";
import { makeExercise, makeSnapshot } from "./workout-test-fixtures";

const plannedSet = (): WorkoutExercise[] => [
  makeExercise("ex1", [
    {
      setNumber: 1,
      weight: 100,
      reps: 10,
      rpe: null,
      completed: false,
      completedAt: null,
      isPR: false,
    },
  ]),
];

describe("applyToggleSet", () => {
  test("completes a set and undo clears it again", () => {
    const done = applyToggleSet(makeSnapshot(plannedSet()), "ex1", 1);
    expect(done?.exercises[0].sets[0].completed).toBe(true);
    expect(done?.exercises[0].sets[0].completedAt).not.toBeNull();
    expect(done?.completedSets).toBe(1);

    const undone = applyToggleSet(
      { ...makeSnapshot(plannedSet()), exercises: done?.exercises ?? [] },
      "ex1",
      1,
    );
    expect(undone?.exercises[0].sets[0].completed).toBe(false);
    expect(undone?.exercises[0].sets[0].completedAt).toBeNull();
    expect(undone?.completedSets).toBe(0);
    expect(undone?.restTimerEndsAt).toBeNull();
  });

  test("returns null for a missing exercise or set", () => {
    expect(applyToggleSet(makeSnapshot([]), "missing", 1)).toBeNull();
    expect(
      applyToggleSet(makeSnapshot([makeExercise("ex1")]), "ex1", 9),
    ).toBeNull();
  });
});
