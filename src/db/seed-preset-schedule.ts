import { eq } from "drizzle-orm";
import type { getDb } from "./client";
import type SEED from "./data.json";
import * as schema from "./schema";
import { scheduleFor } from "./seed-plan";

type SeedDb = ReturnType<typeof getDb>;
type SeedPreset = (typeof SEED.splits)[number];

const scheduleHasRest = (raw: string): boolean => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return (
      typeof parsed === "object" &&
      parsed != null &&
      Object.values(parsed).includes("Rest")
    );
  } catch {
    return false;
  }
};

/**
 * Older seeds cycled a preset's days across all seven weekdays, so a 6-day
 * plan trained every day. Rewrite only those schedules; a preset with an
 * explicit schedule, or one the user has since edited, keeps its week.
 */
export const migratePresetSchedule = async (
  db: SeedDb,
  splitId: string,
  preset: SeedPreset,
  now: Date,
): Promise<void> => {
  if ("schedule" in preset) return;
  const rows = await db
    .select({ schedule: schema.splits.schedule })
    .from(schema.splits)
    .where(eq(schema.splits.id, splitId))
    .limit(1);
  const current = rows[0];
  if (current == null || scheduleHasRest(current.schedule)) return;
  await db
    .update(schema.splits)
    .set({ schedule: JSON.stringify(scheduleFor(preset)), updatedAt: now })
    .where(eq(schema.splits.id, splitId))
    .run();
};
