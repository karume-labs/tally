import { describe, expect, test } from "bun:test";
import SEED from "./data.json";

const exerciseNames = new Set(SEED.exercises.map((row) => row.name));

// The seed skips an exercise it cannot resolve by name, so a typo in a preset
// would quietly seed a shorter workout instead of failing.
describe("seed data", () => {
  test("references only known exercises", () => {
    const missing: string[] = [];
    for (const split of SEED.splits) {
      for (const day of split.days) {
        for (const entry of day.exercises) {
          const name = typeof entry === "string" ? entry : entry.name;
          if (!exerciseNames.has(name)) {
            missing.push(`${split.name} / ${day.name}: ${name}`);
          }
        }
      }
    }
    expect(missing.join("; ")).toBe("");
  });

  test("schedules only days the six-day home preset defines", () => {
    const preset = SEED.splits.find(
      (split) => split.name === "6-Day Home Barbell & Dumbbell",
    );
    const schedule =
      preset != null && "schedule" in preset ? preset.schedule : null;
    if (preset == null || schedule == null) {
      throw new Error("6-day home preset is missing its schedule");
    }
    const dayNames = new Set(preset.days.map((day) => day.name));
    expect(preset.days).toHaveLength(7);
    for (const scheduled of Object.values(schedule)) {
      expect(scheduled === "Rest" || dayNames.has(scheduled)).toBe(true);
    }
  });
});
