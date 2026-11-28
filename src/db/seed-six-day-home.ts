import { eq, inArray } from "drizzle-orm";
import { createId } from "@/lib/utils";
import type { getDb } from "./client";
import type SEED from "./data.json";
import * as schema from "./schema";
import { scheduleFor } from "./seed-plan";
import { replacePresetDayExercises } from "./seed-preset-days";

type SeedDb = ReturnType<typeof getDb>;
type SeedPreset = (typeof SEED.splits)[number];

export const SIX_DAY_HOME_PRESET = "6-Day Home Barbell & Dumbbell";

// What the preset shipped with before the v2 plan. The seed only replaces an
// installed copy while its days and exercises still match this, so a plan the
// user edited is left alone.
const PREVIOUS_PLAN: string[][] = [
  [
    "Dumbbell Floor Fly",
    "Seated Dumbbell African Curl",
    "African Curl",
    "Standard Push-Up",
    "Close-Grip Push-Up",
    "Hand Grip Strengthener",
  ],
  [
    "Barbell Squat",
    "In and Outs",
    "Barbell Romanian Deadlift",
    "Lying Leg Raise",
    "Goblet Squat",
    "Crunch",
  ],
  [],
  [
    "Bent-Over Barbell Row",
    "Barbell Shrug",
    "Barbell Shoulder Press",
    "Barbell Upright Row",
    "Single-Arm Dumbbell Row",
    "Leaned Lateral Raise",
  ],
];

const matchesPreviousPlan = async (
  db: SeedDb,
  splitId: string,
): Promise<boolean> => {
  const days = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId))
    .orderBy(schema.splitDays.dayOrder);
  if (days.length !== PREVIOUS_PLAN.length) return false;

  const links =
    days.length === 0
      ? []
      : await db
          .select()
          .from(schema.splitDayExercises)
          .where(
            inArray(
              schema.splitDayExercises.splitDayId,
              days.map((day) => day.id),
            ),
          );
  const exercises = await db
    .select({ id: schema.exercises.id, name: schema.exercises.name })
    .from(schema.exercises);
  const nameById = new Map(exercises.map((row) => [row.id, row.name]));

  return days.every((day, index) => {
    const names = links
      .filter((link) => link.splitDayId === day.id)
      .sort((a, b) => a.order - b.order)
      .map((link) => nameById.get(link.exerciseId));
    const expected = PREVIOUS_PLAN[index];
    return (
      names.length === expected.length &&
      names.every((name, position) => name === expected[position])
    );
  });
};

interface MigrateSixDayHomeArgs {
  db: SeedDb;
  splitId: string;
  preset: SeedPreset;
  exerciseIdByName: Map<string, string>;
  now: Date;
}

/**
 * Upgrades the 6-day home preset to the v2 plan from the PDF. Existing day rows
 * are reused by index instead of recreated: sessions point at split_days, and a
 * delete would either violate that FK or orphan the history.
 */
export const migrateSixDayHomePlan = async ({
  db,
  splitId,
  preset,
  exerciseIdByName,
  now,
}: MigrateSixDayHomeArgs): Promise<void> => {
  if (preset.name !== SIX_DAY_HOME_PRESET) return;
  if (!(await matchesPreviousPlan(db, splitId))) return;

  await db
    .update(schema.splits)
    .set({
      description: preset.description,
      schedule: JSON.stringify(scheduleFor(preset)),
      updatedAt: now,
    })
    .where(eq(schema.splits.id, splitId))
    .run();

  const existing = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId))
    .orderBy(schema.splitDays.dayOrder);

  for (const [index, day] of preset.days.entries()) {
    const row = existing[index];
    const dayId = row?.id ?? createId();
    if (row == null) {
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
    } else {
      await db
        .update(schema.splitDays)
        .set({ name: day.name, dayOrder: index, isRestDay: day.isRestDay })
        .where(eq(schema.splitDays.id, dayId))
        .run();
    }

    await replacePresetDayExercises(db, dayId, day, exerciseIdByName);
  }
};
