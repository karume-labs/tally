import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "exercises" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "muscle_group" TEXT NOT NULL,
  "equipment" TEXT,
  "is_custom" INTEGER DEFAULT 0,
  "created_at" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "splits" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_preset" INTEGER DEFAULT 0,
  "is_active" INTEGER DEFAULT 0,
  "schedule" TEXT NOT NULL,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "split_days" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "split_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "day_order" INTEGER NOT NULL,
  "is_rest_day" INTEGER DEFAULT 0,
  FOREIGN KEY ("split_id") REFERENCES "splits"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "split_day_exercises" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "split_day_id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "target_sets" INTEGER,
  "target_reps" TEXT,
  "rest_seconds" INTEGER DEFAULT 90,
  "notes" TEXT,
  FOREIGN KEY ("split_day_id") REFERENCES "split_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "split_day_id" TEXT,
  "split_day_name" TEXT,
  "started_at" INTEGER NOT NULL,
  "ended_at" INTEGER,
  "notes" TEXT,
  "duration_seconds" INTEGER,
  "total_volume" REAL,
  "pr_count" INTEGER DEFAULT 0,
  FOREIGN KEY ("split_day_id") REFERENCES "split_days"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "set_logs" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "session_id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "set_number" INTEGER NOT NULL,
  "weight" REAL,
  "reps" INTEGER,
  "rpe" REAL,
  "is_pr" INTEGER DEFAULT 0,
  "completed_at" INTEGER NOT NULL,
  FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "streak_history" (
  "day_key" TEXT PRIMARY KEY NOT NULL,
  "status" TEXT NOT NULL,
  "session_id" TEXT,
  "xp_earned" INTEGER DEFAULT 0,
  FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS "streak_state" (
  "id" INTEGER PRIMARY KEY NOT NULL,
  "current_streak" INTEGER DEFAULT 0,
  "longest_streak" INTEGER DEFAULT 0,
  "last_log_day_key" TEXT,
  "freezes_available" INTEGER DEFAULT 0,
  "freezes_used" INTEGER DEFAULT 0,
  "xp" INTEGER DEFAULT 0,
  "level" INTEGER DEFAULT 1,
  "total_sessions" INTEGER DEFAULT 0,
  "total_volume" REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "xp_events" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "event_type" TEXT NOT NULL,
  "xp_amount" INTEGER NOT NULL,
  "description" TEXT,
  "created_at" INTEGER NOT NULL
);
`.trim();

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Returns the drizzle instance for the Tally SQLite database.
 * Creates the DB file, applies the schema migration (IF NOT EXISTS), and
 * seeds the single streak_state row on first access.
 */
export function getDb() {
  if (_db) {
    return _db;
  }

  const expoDb = openDatabaseSync("tally.db");
  _db = drizzle(expoDb, { schema });

  // Apply schema migration. Uses IF NOT EXISTS so re-runs are safe.
  try {
    // expo-sqlite's database exposes exec() for multi-statement SQL.
    (expoDb as unknown as { exec: (sql: string) => void }).exec(MIGRATION_SQL);
  } catch (_err) {
    // Fallback: run each CREATE individually via execute().
    try {
      const expoAny = expoDb as unknown as {
        execute: (sql: string) => void;
      };
      for (const stmt of MIGRATION_SQL.split(";")
        .map((s) => s.trim())
        .filter(Boolean)) {
        expoAny.execute(stmt);
      }
    } catch (fallbackErr) {
      console.warn(
        "[tally.db] migration failed, both exec and execute:",
        fallbackErr,
      );
    }
  }

  return _db;
}

/**
 * initializeSchema ensures the single-row streak_state row exists.
 * Call this from the app root layout so the DB is ready on first render.
 */
export async function initializeSchema() {
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
}
