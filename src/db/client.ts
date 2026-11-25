import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { MIGRATION_SQL } from "./migration-sql";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Returns the drizzle instance for the Tally SQLite database.
 * Creates the DB file, applies the schema migration (IF NOT EXISTS), and
 * seeds the single streak_state row on first access.
 */
export const getDb = () => {
  if (_db) {
    return _db;
  }

  const expoDb = openDatabaseSync("tally.db");
  _db = drizzle(expoDb, { schema });

  // Apply schema migration. Uses IF NOT EXISTS so re-runs are safe.
  try {
    expoDb.execSync(MIGRATION_SQL);
    // SQLite has no ADD COLUMN IF NOT EXISTS, so new columns are added only
    // when an older database does not already have them.
    const columns = expoDb.getAllSync<{ name: string }>(
      `PRAGMA table_info("split_day_exercises")`,
    );
    if (!columns.some((column) => column.name === "superset_group")) {
      expoDb.execSync(
        `ALTER TABLE "split_day_exercises" ADD COLUMN "superset_group" TEXT`,
      );
    }
  } catch (err) {
    console.error("[tally.db] migration failed:", err);
  }

  return _db;
};

/**
 * initializeSchema ensures the single-row streak_state row exists.
 * Call this from the app root layout so the DB is ready on first render.
 */
export const initializeSchema = async () => {
  const db = getDb();

  try {
    await db
      .insert(schema.streakState)
      .values({
        id: 1,
        currentStreak: 0,
        longestStreak: 0,
        freezesAvailable: 0,
        freezesUsed: 0,
        xp: 0,
        level: 1,
        totalSessions: 0,
        totalVolume: 0,
      })
      .onConflictDoNothing()
      .run();
  } catch (err) {
    console.warn("[tally.db] streak_state seed skipped:", err);
  }
};
