import { describe, expect, test } from "bun:test";
import { buildFinishResult } from "./workout-store-finish";
import { makeExercise, makeSet } from "./workout-test-fixtures";

describe("workout-store-finish", () => {
  test("computes durationSeconds and prCount", () => {
    const exercises = [
      makeExercise("ex1", [makeSet(1, { isPR: true }), makeSet(2)]),
    ];

    const result = buildFinishResult(
      {
        exercises,
        prBest: {},
        restTimerEndsAt: null,
        totalVolume: 2000,
        completedSets: 2,
      },
      Date.now() - 60_000,
    );

    expect(result.durationSeconds).toBeGreaterThanOrEqual(59);
    expect(result.durationSeconds).toBeLessThanOrEqual(61);
    expect(result.prCount).toBe(1);
    expect(result.totalVolume).toBe(2000);
    expect(result.completedSets).toBe(2);
    expect(result.setLogs.length).toBe(2);
    expect(result.setLogs[0].setNumber).toBe(1);
  });
});
