import { describe, expect, test } from "bun:test";
import type { WorkoutExercise, WorkoutSet } from "@/shared/types/workout-types";
import {
  completedSets,
  isExerciseComplete,
  pickNextExercise,
  sessionSetTotal,
} from "./next-exercise";

const set = (setNumber: number, completed: boolean): WorkoutSet => ({
  setNumber,
  weight: 50,
  reps: 10,
  rpe: null,
  completed,
  completedAt: completed ? 1 : null,
  isPR: false,
});

const exercise = (
  id: string,
  targetSets: number | null,
  sets: WorkoutSet[],
): WorkoutExercise => ({
  exerciseId: id,
  name: id,
  muscleGroup: "chest",
  equipment: null,
  targetSets,
  targetReps: "8-12",
  restSeconds: 90,
  notes: "",
  sets,
});

describe("next-exercise", () => {
  test("counts only completed sets", () => {
    expect(completedSets(exercise("a", 3, [set(1, true), set(2, false)]))).toBe(
      1,
    );
  });

  test("completes when the target is met", () => {
    const done = exercise("a", 2, [set(1, true), set(2, true)]);
    expect(isExerciseComplete(done)).toBe(true);
  });

  test("exercises without a target count after one set", () => {
    expect(isExerciseComplete(exercise("a", null, [set(1, true)]))).toBe(true);
    expect(isExerciseComplete(exercise("a", 0, []))).toBe(false);
  });

  test("keeps the current exercise until it is finished", () => {
    const current = exercise("a", 3, [set(1, true)]);
    const next = exercise("b", 3, []);
    expect(pickNextExercise([current, next], "a")?.exerciseId).toBe("a");
  });

  test("moves to the next unfinished exercise when the current is done", () => {
    const current = exercise("a", 1, [set(1, true)]);
    const done = exercise("b", 1, [set(1, true)]);
    const next = exercise("c", 2, []);
    expect(pickNextExercise([current, done, next], "a")?.exerciseId).toBe("c");
  });

  test("sums programmed sets, counting untargeted exercises once", () => {
    const exercises = [
      exercise("a", 3, []),
      exercise("b", null, []),
      exercise("c", 2, []),
    ];
    expect(sessionSetTotal(exercises)).toBe(6);
    expect(sessionSetTotal([])).toBe(0);
  });

  test("returns null when every exercise is complete", () => {
    const a = exercise("a", 1, [set(1, true)]);
    const b = exercise("b", 1, [set(1, true)]);
    expect(pickNextExercise([a, b], "a")).toBeNull();
  });
});
