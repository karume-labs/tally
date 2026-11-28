import { eq } from "drizzle-orm";
import { resolveTarget, scheduleFor } from "@/db/seed-plan";
import { migratePresetSchedule } from "@/db/seed-preset-schedule";
import { migrateSixDayHomePlan } from "@/db/seed-six-day-home";
import { backfillSupersetGroups } from "@/db/seed-superset-backfill";
import { getDb } from "./client";
import SEED from "./data.json";
import * as schema from "./schema";

const newId = (): string =>
  `seed_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

/**
 * Seeds exercises, preset splits and their day plans.
 *
 * Rows are batched per table rather than inserted one by one: on web every
 * statement is a round trip to the SQLite worker, and the per-row version ran
 * long enough to trip its sync timeout, leaving presets half-seeded.
 */
export const seed = async () => {
  const db = getDb();
  const now = new Date();

  const existingExercises = await db
    .select({ name: schema.exercises.name })
    .from(schema.exercises);
  const knownNames = new Set(existingExercises.map((row) => row.name));
  const missingExercises = SEED.exercises
    .filter((exercise) => !knownNames.has(exercise.name))
    .map((exercise) => ({
      id: newId(),
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      isCustom: false,
      createdAt: now,
    }));

  if (missingExercises.length > 0) {
    try {
      await db
        .insert(schema.exercises)
        .values(missingExercises)
        .onConflictDoNothing();
    } catch (err) {
      console.warn("[tally.seed] exercise batch skipped:", err);
    }
  }

  // Resolve names once instead of querying per split-day exercise.
  const allExercises = await db
    .select({ id: schema.exercises.id, name: schema.exercises.name })
    .from(schema.exercises);
  const exerciseIdByName = new Map(
    allExercises.map((row) => [row.name, row.id]),
  );

  const existingPresets = await db
    .select({ id: schema.splits.id, name: schema.splits.name })
    .from(schema.splits)
    .where(eq(schema.splits.isPreset, true));
  const presetIdByName = new Map(
    existingPresets.map((row) => [row.name, row.id]),
  );

  for (const preset of SEED.splits) {
    const existingId = presetIdByName.get(preset.name);
    if (existingId != null) {
      try {
        await migrateSixDayHomePlan({
          db,
          splitId: existingId,
          preset,
          exerciseIdByName,
          now,
        });
        await backfillSupersetGroups(db, existingId, preset);
        await migratePresetSchedule(db, existingId, preset, now);
      } catch (err) {
        console.warn(`[tally.seed] backfill failed "${preset.name}":`, err);
      }
      continue;
    }
    try {
      const splitId = newId();
      const dayRows = preset.days.map((day, index) => ({
        id: newId(),
        splitId,
        name: day.name,
        dayOrder: index,
        isRestDay: day.isRestDay,
      }));

      const linkRows: Array<{
        id: string;
        splitDayId: string;
        exerciseId: string;
        order: number;
        targetSets: number;
        targetReps: string;
        restSeconds: number;
        notes: string | null;
        supersetGroup: string | null;
      }> = [];
      preset.days.forEach((day, dayIndex) => {
        day.exercises.forEach((entry, exerciseIndex) => {
          const target = resolveTarget(entry);
          const exerciseId = exerciseIdByName.get(target.name);
          if (exerciseId == null) return;
          linkRows.push({
            id: newId(),
            splitDayId: dayRows[dayIndex].id,
            exerciseId,
            order: exerciseIndex,
            targetSets: target.sets,
            targetReps: target.reps,
            restSeconds: target.rest,
            notes: target.notes.length > 0 ? target.notes : null,
            supersetGroup: target.group.length > 0 ? target.group : null,
          });
        });
      });

      await db.insert(schema.splits).values({
        id: splitId,
        name: preset.name,
        description: preset.description,
        isPreset: true,
        isActive: false,
        schedule: JSON.stringify(scheduleFor(preset)),
        createdAt: now,
        updatedAt: now,
      });
      if (dayRows.length > 0) {
        await db.insert(schema.splitDays).values(dayRows);
      }
      if (linkRows.length > 0) {
        await db.insert(schema.splitDayExercises).values(linkRows);
      }
    } catch (err) {
      console.warn(`[tally.seed] skipped preset "${preset.name}":`, err);
    }
  }

  console.log("[tally.seed] seed complete");
};
