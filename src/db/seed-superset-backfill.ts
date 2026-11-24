import { eq, inArray } from "drizzle-orm";
import type { getDb } from "./client";
import * as schema from "./schema";
import { resolveTarget, type SeedPreset } from "./seed-plan";

type Db = ReturnType<typeof getDb>;

/**
 * Adds superset labels to a preset that was seeded before the column existed.
 * Rows are matched by day order and exercise order, the same order the seed
 * writes them in, so a preset that already exists is repaired instead of being
 * duplicated or skipped.
 */
export const backfillSupersetGroups = async (
  db: Db,
  splitId: string,
  preset: SeedPreset,
) => {
  const days = await db
    .select()
    .from(schema.splitDays)
    .where(eq(schema.splitDays.splitId, splitId))
    .orderBy(schema.splitDays.dayOrder);
  if (days.length === 0) return;

  const links = await db
    .select()
    .from(schema.splitDayExercises)
    .where(
      inArray(
        schema.splitDayExercises.splitDayId,
        days.map((day) => day.id),
      ),
    );

  for (const [dayIndex, day] of preset.days.entries()) {
    const splitDay = days[dayIndex];
    if (splitDay == null) continue;
    const dayLinks = links
      .filter((link) => link.splitDayId === splitDay.id)
      .sort((a, b) => a.order - b.order);

    for (const [index, entry] of day.exercises.entries()) {
      const target = resolveTarget(entry);
      const link = dayLinks[index];
      const group = target.group.length > 0 ? target.group : null;
      if (link == null || link.supersetGroup === group) continue;
      await db
        .update(schema.splitDayExercises)
        .set({ supersetGroup: group })
        .where(eq(schema.splitDayExercises.id, link.id));
    }
  }
};
