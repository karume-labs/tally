import { startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import * as schema from "./schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function ulidLike(): string {
  // Simple deterministic-ish id for seeds. Replace with a real ulid/cuid import
  // if the project adds one. Good enough for seed data.
  return `seed_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// ─── Preset Exercises ────────────────────────────────────────────────────────────
const PRESET_EXERCISES = [
  // Chest
  { name: "Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { name: "Incline Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { name: "Dumbbell Bench Press", muscleGroup: "chest", equipment: "dumbbell" },
  {
    name: "Incline Dumbbell Press",
    muscleGroup: "chest",
    equipment: "dumbbell",
  },
  { name: "Chest Fly", muscleGroup: "chest", equipment: "dumbbell" },
  { name: "Cable Fly", muscleGroup: "chest", equipment: "cable" },
  { name: "Push-Up", muscleGroup: "chest", equipment: "bodyweight" },
  { name: "Dips", muscleGroup: "chest", equipment: "bodyweight" },
  // Back
  { name: "Deadlift", muscleGroup: "back", equipment: "barbell" },
  { name: "Barbell Row", muscleGroup: "back", equipment: "barbell" },
  { name: "Pendlay Row", muscleGroup: "back", equipment: "barbell" },
  { name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbell" },
  { name: "Pull-Up", muscleGroup: "back", equipment: "bodyweight" },
  { name: "Chin-Up", muscleGroup: "back", equipment: "bodyweight" },
  { name: "Lat Pulldown", muscleGroup: "back", equipment: "cable" },
  { name: "Seated Cable Row", muscleGroup: "back", equipment: "cable" },
  { name: "Face Pull", muscleGroup: "back", equipment: "cable" },
  { name: "T-Bar Row", muscleGroup: "back", equipment: "barbell" },
  // Legs
  { name: "Squat", muscleGroup: "legs", equipment: "barbell" },
  { name: "Front Squat", muscleGroup: "legs", equipment: "barbell" },
  { name: "Leg Press", muscleGroup: "legs", equipment: "machine" },
  { name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: "dumbbell" },
  { name: "Lunges", muscleGroup: "legs", equipment: "dumbbell" },
  { name: "Romanian Deadlift", muscleGroup: "legs", equipment: "barbell" },
  { name: "Leg Curl", muscleGroup: "legs", equipment: "machine" },
  { name: "Leg Extension", muscleGroup: "legs", equipment: "machine" },
  { name: "Calf Raise", muscleGroup: "legs", equipment: "machine" },
  { name: "Hack Squat", muscleGroup: "legs", equipment: "machine" },
  // Shoulders
  { name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell" },
  {
    name: "Seated Dumbbell Press",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
  },
  { name: "Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Front Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Cable Lateral Raise", muscleGroup: "shoulders", equipment: "cable" },
  { name: "Shrug", muscleGroup: "shoulders", equipment: "barbell" },
  // Arms
  { name: "Barbell Curl", muscleGroup: "arms", equipment: "barbell" },
  { name: "Dumbbell Curl", muscleGroup: "arms", equipment: "dumbbell" },
  { name: "Hammer Curl", muscleGroup: "arms", equipment: "dumbbell" },
  { name: "Preacher Curl", muscleGroup: "arms", equipment: "barbell" },
  { name: "Tricep Pushdown", muscleGroup: "arms", equipment: "cable" },
  { name: "Skull Crusher", muscleGroup: "arms", equipment: "barbell" },
  {
    name: "Overhead Tricep Extension",
    muscleGroup: "arms",
    equipment: "dumbbell",
  },
  { name: "Close-Grip Bench Press", muscleGroup: "arms", equipment: "barbell" },
  // Core
  { name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Cable Crunch", muscleGroup: "core", equipment: "cable" },
  { name: "Ab Wheel", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Russian Twist", muscleGroup: "core", equipment: "dumbbell" },
  // Full body / compound
  { name: "Power Clean", muscleGroup: "full_body", equipment: "barbell" },
  { name: "Hang Clean", muscleGroup: "full_body", equipment: "barbell" },
  { name: "Snatch", muscleGroup: "full_body", equipment: "barbell" },
  { name: "Clean and Jerk", muscleGroup: "full_body", equipment: "barbell" },
  { name: "Good Morning", muscleGroup: "legs", equipment: "barbell" },
  { name: "Hip Thrust", muscleGroup: "legs", equipment: "barbell" },
  { name: "Glute Bridge", muscleGroup: "legs", equipment: "bodyweight" },
  { name: "Step-Up", muscleGroup: "legs", equipment: "dumbbell" },
];

// ─── Preset Splits ───────────────────────────────────────────────────────────────
interface SplitPreset {
  name: string;
  description: string;
  days: { name: string; isRestDay: boolean; exercises: string[] }[];
}

const PRESET_SPLITS: SplitPreset[] = [
  {
    name: "Push / Pull / Legs",
    description:
      "Classic 6-day PPL. Push, Pull, Legs, repeat. High frequency per muscle group.",
    days: [
      {
        name: "Push A",
        isRestDay: false,
        exercises: [
          "Bench Press",
          "Incline Dumbbell Press",
          "Lateral Raise",
          "Tricep Pushdown",
          "Overhead Tricep Extension",
          "Push-Up",
        ],
      },
      {
        name: "Pull A",
        isRestDay: false,
        exercises: [
          "Pull-Up",
          "Barbell Row",
          "Lat Pulldown",
          "Face Pull",
          "Barbell Curl",
          "Hammer Curl",
        ],
      },
      {
        name: "Legs A",
        isRestDay: false,
        exercises: [
          "Squat",
          "Romanian Deadlift",
          "Leg Press",
          "Leg Curl",
          "Calf Raise",
          "Plank",
        ],
      },
      {
        name: "Push B",
        isRestDay: false,
        exercises: [
          "Incline Bench Press",
          "Dumbbell Bench Press",
          "Cable Fly",
          "Dips",
          "Skull Crusher",
          "Lateral Raise",
        ],
      },
      {
        name: "Pull B",
        isRestDay: false,
        exercises: [
          "Chin-Up",
          "Dumbbell Row",
          "Seated Cable Row",
          "Lat Pulldown",
          "Preacher Curl",
          "Tricep Pushdown",
        ],
      },
      {
        name: "Legs B",
        isRestDay: false,
        exercises: [
          "Front Squat",
          "Bulgarian Split Squat",
          "Leg Extension",
          "Leg Curl",
          "Hip Thrust",
          "Hanging Leg Raise",
        ],
      },
    ],
  },
  {
    name: "Upper / Lower",
    description:
      "4-day Upper/Lower split. Great balance of frequency and recovery for most lifters.",
    days: [
      {
        name: "Upper A",
        isRestDay: false,
        exercises: [
          "Bench Press",
          "Barbell Row",
          "Overhead Press",
          "Pull-Up",
          "Dumbbell Curl",
          "Tricep Pushdown",
        ],
      },
      {
        name: "Lower A",
        isRestDay: false,
        exercises: [
          "Squat",
          "Romanian Deadlift",
          "Leg Press",
          "Leg Curl",
          "Calf Raise",
          "Plank",
        ],
      },
      {
        name: "Upper B",
        isRestDay: false,
        exercises: [
          "Incline Bench Press",
          "Pendlay Row",
          "Seated Dumbbell Press",
          "Lat Pulldown",
          "Hammer Curl",
          "Skull Crusher",
        ],
      },
      {
        name: "Lower B",
        isRestDay: false,
        exercises: [
          "Front Squat",
          "Bulgarian Split Squat",
          "Leg Extension",
          "Leg Curl",
          "Hip Thrust",
          "Hanging Leg Raise",
        ],
      },
    ],
  },
  {
    name: "Arnold Split",
    description:
      "Arnold Schwarzenegger's 6-day split. Chest+Back, Shoulders+Arms, Legs, repeat. High volume.",
    days: [
      {
        name: "Chest & Back A",
        isRestDay: false,
        exercises: [
          "Bench Press",
          "Incline Dumbbell Press",
          "Dumbbell Fly",
          "Pull-Up",
          "Barbell Row",
          "Lat Pulldown",
          "Face Pull",
        ],
      },
      {
        name: "Shoulders & Arms A",
        isRestDay: false,
        exercises: [
          "Overhead Press",
          "Lateral Raise",
          "Rear Delt Fly",
          "Barbell Curl",
          "Hammer Curl",
          "Tricep Pushdown",
          "Skull Crusher",
        ],
      },
      {
        name: "Legs & Abs A",
        isRestDay: false,
        exercises: [
          "Squat",
          "Romanian Deadlift",
          "Leg Press",
          "Leg Curl",
          "Calf Raise",
          "Hanging Leg Raise",
          "Plank",
        ],
      },
      {
        name: "Chest & Back B",
        isRestDay: false,
        exercises: [
          "Incline Bench Press",
          "Dumbbell Bench Press",
          "Cable Fly",
          "Chin-Up",
          "Dumbbell Row",
          "Seated Cable Row",
          "T-Bar Row",
        ],
      },
      {
        name: "Shoulders & Arms B",
        isRestDay: false,
        exercises: [
          "Seated Dumbbell Press",
          "Arnold Press",
          "Cable Lateral Raise",
          "Preacher Curl",
          "Dumbbell Curl",
          "Close-Grip Bench Press",
          "Overhead Tricep Extension",
        ],
      },
      {
        name: "Legs & Abs B",
        isRestDay: false,
        exercises: [
          "Front Squat",
          "Bulgarian Split Squat",
          "Hack Squat",
          "Leg Extension",
          "Hip Thrust",
          "Cable Crunch",
          "Ab Wheel",
        ],
      },
    ],
  },
  {
    name: "StrongLifts 5x5",
    description:
      "5 sets of 5 reps on core lifts. Alternate Workout A and B three days per week.",
    days: [
      {
        name: "Workout A",
        isRestDay: false,
        exercises: ["Squat", "Bench Press", "Barbell Row"],
      },
      {
        name: "Workout B",
        isRestDay: false,
        exercises: ["Squat", "Overhead Press", "Deadlift"],
      },
    ],
  },
  {
    name: "Bro Split (Body Part)",
    description:
      "One muscle group per day, 5-6 days per week. High volume per session, lower frequency.",
    days: [
      {
        name: "Chest",
        isRestDay: false,
        exercises: [
          "Bench Press",
          "Incline Dumbbell Press",
          "Dumbbell Fly",
          "Cable Fly",
          "Dips",
          "Push-Up",
        ],
      },
      {
        name: "Back",
        isRestDay: false,
        exercises: [
          "Deadlift",
          "Pull-Up",
          "Barbell Row",
          "Lat Pulldown",
          "Seated Cable Row",
          "Face Pull",
        ],
      },
      {
        name: "Legs",
        isRestDay: false,
        exercises: [
          "Squat",
          "Leg Press",
          "Romanian Deadlift",
          "Leg Extension",
          "Leg Curl",
          "Calf Raise",
          "Hip Thrust",
        ],
      },
      {
        name: "Shoulders",
        isRestDay: false,
        exercises: [
          "Overhead Press",
          "Seated Dumbbell Press",
          "Lateral Raise",
          "Front Raise",
          "Rear Delt Fly",
          "Shrug",
        ],
      },
      {
        name: "Arms",
        isRestDay: false,
        exercises: [
          "Barbell Curl",
          "Dumbbell Curl",
          "Hammer Curl",
          "Preacher Curl",
          "Tricep Pushdown",
          "Skull Crusher",
          "Close-Grip Bench Press",
        ],
      },
      {
        name: "Core",
        isRestDay: false,
        exercises: [
          "Plank",
          "Hanging Leg Raise",
          "Cable Crunch",
          "Ab Wheel",
          "Russian Twist",
        ],
      },
    ],
  },
  {
    name: "Full Body",
    description:
      "3-day full body. Hit every major muscle group each session. Best for beginners and busy schedules.",
    days: [
      {
        name: "Full Body A",
        isRestDay: false,
        exercises: [
          "Squat",
          "Bench Press",
          "Barbell Row",
          "Overhead Press",
          "Plank",
        ],
      },
      {
        name: "Full Body B",
        isRestDay: false,
        exercises: [
          "Front Squat",
          "Incline Bench Press",
          "Pull-Up",
          "Romanian Deadlift",
          "Lateral Raise",
        ],
      },
      {
        name: "Full Body C",
        isRestDay: false,
        exercises: [
          "Deadlift",
          "Dumbbell Bench Press",
          "Dumbbell Row",
          "Leg Press",
          "Face Pull",
        ],
      },
    ],
  },
];

// Weekly schedule for all presets: Mon..Sun mapped to split day names.
// Presets are imported with a default weekday assignment derived from day order.
function defaultWeeklySchedule(dayNames: string[]): Record<string, string> {
  const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const schedule: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const dayName = dayNames[i % dayNames.length];
    schedule[weekdays[i]] = dayName;
  }
  return schedule;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────────
export async function seed() {
  const db = getDb();

  // 1) Exercises (upsert by name so re-running seed is safe).
  for (const ex of PRESET_EXERCISES) {
    try {
      await db
        .insert(schema.exercises)
        .values({
          id: ulidLike(),
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          isCustom: false,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (_err) {
      console.warn(`[tally.seed] skipped exercise "${ex.name}":`, _err);
    }
  }

  // 2) Preset splits + split days + split day exercises.
  for (const preset of PRESET_SPLITS) {
    try {
      // Skip if a preset with this name already exists.
      const existing = await db
        .select({ id: schema.splits.id })
        .from(schema.splits)
        .where(
          and(
            eq(schema.splits.name, preset.name),
            eq(schema.splits.isPreset, true),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        continue;
      }

      const splitId = ulidLike();
      const now = new Date();
      const schedule = defaultWeeklySchedule(preset.days.map((d) => d.name));

      await db.insert(schema.splits).values({
        id: splitId,
        name: preset.name,
        description: preset.description,
        isPreset: true,
        isActive: false,
        schedule: JSON.stringify(schedule),
        createdAt: now,
        updatedAt: now,
      });

      const dayIds: string[] = [];
      for (let i = 0; i < preset.days.length; i++) {
        const day = preset.days[i];
        const dayId = ulidLike();
        dayIds.push(dayId);
        await db.insert(schema.splitDays).values({
          id: dayId,
          splitId,
          name: day.name,
          dayOrder: i,
          isRestDay: day.isRestDay,
        });
      }

      for (let di = 0; di < dayIds.length; di++) {
        const dayId = dayIds[di];
        const day = preset.days[di];
        for (let ei = 0; ei < day.exercises.length; ei++) {
          const exerciseName = day.exercises[ei];
          const exercise = await db
            .select({ id: schema.exercises.id })
            .from(schema.exercises)
            .where(eq(schema.exercises.name, exerciseName))
            .limit(1);

          if (exercise.length === 0) {
            continue;
          }

          await db.insert(schema.splitDayExercises).values({
            id: ulidLike(),
            splitDayId: dayId,
            exerciseId: exercise[0].id,
            order: ei,
            targetSets: 3,
            targetReps: "8-12",
            restSeconds: 90,
          });
        }
      }
    } catch (_err) {
      console.warn(`[tally.seed] skipped preset "${preset.name}":`, _err);
    }
  }

  console.log("[tally.seed] seed complete");
}
