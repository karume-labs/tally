/**
 * The schema the app expects, applied on first open. Kept apart from the client
 * so the connection setup reads as code rather than one long SQL literal.
 */
export const MIGRATION_SQL = `
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
