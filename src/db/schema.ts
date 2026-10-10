import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ─── Exercise Library ──────────────────────────────────────────────────────────
export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── Splits ─────────────────────────────────────────────────────────────────────
export const splits = sqliteTable("splits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPreset: integer("is_preset", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(false),
  schedule: text("schedule").notNull(), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── Split Days ─────────────────────────────────────────────────────────────────
export const splitDays = sqliteTable("split_days", {
  id: text("id").primaryKey(),
  splitId: text("split_id")
    .notNull()
    .references(() => splits.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dayOrder: integer("day_order").notNull(),
  isRestDay: integer("is_rest_day", { mode: "boolean" }).default(false),
});

// ─── Split Day Exercises (ordered) ─────────────────────────────────────────────
export const splitDayExercises = sqliteTable("split_day_exercises", {
  id: text("id").primaryKey(),
  splitDayId: text("split_day_id")
    .notNull()
    .references(() => splitDays.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  order: integer("order").notNull(),
  targetSets: integer("target_sets"),
  targetReps: text("target_reps"),
  restSeconds: integer("rest_seconds").default(90),
  notes: text("notes"),
});

// ─── Sessions ───────────────────────────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  splitDayId: text("split_day_id").references(() => splitDays.id),
  splitDayName: text("split_day_name"),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  notes: text("notes"),
  durationSeconds: integer("duration_seconds"),
  totalVolume: real("total_volume"),
  prCount: integer("pr_count").default(0),
});

// ─── Set Logs ───────────────────────────────────────────────────────────────────
export const setLogs = sqliteTable("set_logs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  weight: real("weight"),
  reps: integer("reps"),
  rpe: real("rpe"),
  isPR: integer("is_pr", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

// ─── Streak State (single row, id = 1) ─────────────────────────────────────────
export const streakState = sqliteTable("streak_state", {
  id: integer("id").primaryKey(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastLogDayKey: text("last_log_day_key"),
  freezesAvailable: integer("freezes_available").default(0),
  freezesUsed: integer("freezes_used").default(0),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  totalSessions: integer("total_sessions").default(0),
  totalVolume: real("total_volume").default(0),
});

// ─── Streak History (for heatmap) ───────────────────────────────────────────────
export const streakHistory = sqliteTable("streak_history", {
  dayKey: text("day_key").primaryKey(),
  status: text("status").notNull(), // 'workout' | 'rest' | 'freeze' | 'missed'
  sessionId: text("session_id").references(() => sessions.id),
  xpEarned: integer("xp_earned").default(0),
});

// ─── XP Events ──────────────────────────────────────────────────────────────────
export const xpEvents = sqliteTable("xp_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'session_complete' | 'pr' | 'streak_milestone'
  xpAmount: integer("xp_amount").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
