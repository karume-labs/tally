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

const defaultWeeklySchedule = (dayNames: string[]): Record<string, string> => {
  const schedule: Record<string, string> = {};
  for (let i = 0; i < WEEKDAYS.length; i++) {
    schedule[WEEKDAYS[i]] = dayNames[i % dayNames.length];
  }
  return schedule;
};

// An explicit schedule lets a preset repeat days non-cyclically (e.g. Wed off)
// instead of cycling its day list across the week.
export const scheduleFor = (preset: SeedPreset): Record<string, string> => {
  const explicit = "schedule" in preset ? preset.schedule : null;
  return explicit ?? defaultWeeklySchedule(preset.days.map((day) => day.name));
};
