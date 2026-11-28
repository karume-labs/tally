import { eq } from "drizzle-orm";
import type { getDb } from "./client";
import type SEED from "./data.json";
import * as schema from "./schema";
import { REST_DAY_NAME, scheduleFor } from "./seed-plan";

type SeedDb = ReturnType<typeof getDb>;
type SeedPreset = (typeof SEED.splits)[number];

const parseSlots = (raw: string): Record<string, string> | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed != null
      ? (parsed as Record<string, string>)
      : null;
  } catch {
    return null;
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
  const rows = await db
    .select({ schedule: schema.splits.schedule })
    .from(schema.splits)
    .where(eq(schema.splits.id, splitId))
    .limit(1);
  const current = rows[0];
  if (current == null) return;

  const canonical = JSON.stringify(scheduleFor(preset));
  if (current.schedule === canonical) return;

  // Only rewrite a week that still names this preset's own days. Someone who
  // renamed or replaced days has made the split their own, so keep their week.
  const allowed = new Set([
    REST_DAY_NAME,
    ...preset.days.map((day) => day.name),
  ]);
  const slots = parseSlots(current.schedule);
  if (slots == null) return;
  if (!Object.values(slots).every((name) => allowed.has(name))) return;

  await db
    .update(schema.splits)
    .set({ schedule: canonical, updatedAt: now })
    .where(eq(schema.splits.id, splitId))
    .run();
};
