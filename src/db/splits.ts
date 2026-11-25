import { createId } from "@/lib/utils";
import { getDb } from "./client";
import * as schema from "./schema";
import { replaceDayExercises } from "./split-day-writes";

export interface SplitDayInput {
  id?: string;
  name: string;
  isRestDay: boolean;
  exercises: SplitDayExerciseInput[];
}

export interface SplitDayExerciseInput {
  exerciseId: string;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number;
  supersetGroup: string | null;
}

export interface SplitInput {
  name: string;
  description: string;
  days: SplitDayInput[];
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * The weekly schedule a hand-built split uses: its day templates cycle across
 * Monday–Sunday. A rest day still occupies its slot; whether it is recovery is
 * the day's `isRestDay` flag, never its name.
 */
export const buildSchedule = (dayNames: string[]): Record<string, string> => {
  const schedule: Record<string, string> = {};
  if (dayNames.length === 0) return schedule;
  for (let i = 0; i < WEEKDAYS.length; i++) {
    schedule[WEEKDAYS[i]] = dayNames[i % dayNames.length];
  }
  return schedule;
};

export const createSplit = async (input: SplitInput): Promise<string> => {
  const db = getDb();
  const now = new Date();
  const splitId = createId();
  await db
    .insert(schema.splits)
    .values({
      id: splitId,
      name: input.name,
      description: input.description,
      isPreset: false,
      isActive: false,
      schedule: JSON.stringify(
        buildSchedule(input.days.map((day) => day.name)),
      ),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  for (const [index, day] of input.days.entries()) {
    const dayId = createId();
    await db
      .insert(schema.splitDays)
      .values({
        id: dayId,
        splitId,
        name: day.name,
        dayOrder: index,
        isRestDay: day.isRestDay,
      })
      .run();
    await replaceDayExercises(dayId, day);
  }

  return splitId;
};
