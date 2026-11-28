import type SEED from "./data.json";

export interface SeedTarget {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes: string;
  group: string;
}

export type SeedPreset = (typeof SEED.splits)[number];

// Presets that only list exercise names get the generic 3 × 8-12 target; a
// preset can spell out rounds/reps/rest per exercise instead.
const DEFAULT_TARGET = {
  sets: 3,
  reps: "8-12",
  rest: 90,
  notes: "",
  group: "",
};

export const resolveTarget = (entry: string | SeedTarget): SeedTarget =>
  typeof entry === "string" ? { ...DEFAULT_TARGET, name: entry } : entry;

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** A schedule slot with no training is a rest day, row or not. */
export const REST_DAY_NAME = "Rest";

// Spread training across the week instead of cycling every day: a 6-day split
// still gets one rest day, and StrongLifts' "three days per week" is three.
const TRAINING_SLOTS: Record<number, string[]> = {
  1: ["mon"],
  2: ["mon", "thu"],
  3: ["mon", "wed", "fri"],
  4: ["mon", "tue", "thu", "fri"],
  5: ["mon", "tue", "wed", "fri", "sat"],
  6: ["mon", "tue", "wed", "thu", "fri", "sat"],
  7: WEEKDAYS,
};

const defaultWeeklySchedule = (dayNames: string[]): Record<string, string> => {
  const schedule: Record<string, string> = {};
  for (const day of WEEKDAYS) schedule[day] = REST_DAY_NAME;

  const trainingDays = dayNames.slice(0, 7);
  const slots = TRAINING_SLOTS[trainingDays.length] ?? WEEKDAYS;
  trainingDays.forEach((name, index) => {
    schedule[slots[index]] = name;
  });
  return schedule;
};

// An explicit schedule lets a preset repeat days non-cyclically (e.g. Wed off)
// instead of cycling its day list across the week.
export const scheduleFor = (preset: SeedPreset): Record<string, string> => {
  const explicit = "schedule" in preset ? preset.schedule : null;
  return explicit ?? defaultWeeklySchedule(preset.days.map((day) => day.name));
};
