// ─── Muscle Groups ───────────────────────────────────────────────────────────────
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// ─── Equipment ───────────────────────────────────────────────────────────────────
export const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
] as const;

export type Equipment = (typeof EQUIPMENT)[number];

// ─── Streak Status ───────────────────────────────────────────────────────────────
export const STREAK_STATUS = {
  WORKOUT: "workout",
  REST: "rest",
  FREEZE: "freeze",
  MISSED: "missed",
} as const;

export type StreakStatus = (typeof STREAK_STATUS)[keyof typeof STREAK_STATUS];

// ─── XP ──────────────────────────────────────────────────────────────────────────
export const XP_VALUES = {
  sessionComplete: 50,
  prPerSet: 25,
  streakMilestone: (streak: number) => {
    if (streak === 7) return 200;
    if (streak === 30) return 500;
    if (streak === 100) return 2000;
    if (streak === 365) return 10000;
    return 0;
  },
} as const;

export const XP_PER_LEVEL = 500;

// ─── Streak Milestones ───────────────────────────────────────────────────────────
export const STREAK_MILESTONES = [7, 30, 100, 365] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

// ─── Freeze Tokens ───────────────────────────────────────────────────────────────
export const FREEZE_EARN_AT = [7, 30, 100] as const; // earn a freeze at these milestones
export const MAX_FREEZES = 3;

// ─── Default Settings ────────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  rolloverHour: 6, // day rolls over at 6am local time
  defaultRestSeconds: 90,
  hapticsEnabled: true,
  soundEnabled: true,
  autoAdvance: false,
  onboarded: false,
} as const;

// ─── Deep Link Routes ────────────────────────────────────────────────────────────
export const DEEP_LINKS = {
  home: "tally://",
  streak: "tally://streak",
  workout: "tally://workout/active",
  summary: "tally://workout/summary",
  splits: "tally://splits",
  exercises: "tally://exercises",
  settings: "tally://settings",
} as const;

// ─── Notifications ───────────────────────────────────────────────────────────────
export const NOTIFICATION_CHANNELS = {
  restTimer: "rest-timer",
  streak: "streak",
} as const;

export const REST_NOTIFICATION_ID = 1000;

// ─── MMKV Widget Keys ────────────────────────────────────────────────────────────
export const WIDGET_KEYS = {
  streak: "widget.streak",
  streakLast7: "widget.streak.last7",
  today: "widget.today",
  data: "widget.data",
  updatedAt: "widget.updatedAt",
} as const;

// ─── Session ─────────────────────────────────────────────────────────────────────
export const SESSION_ACTIVE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min before auto-cancel warning
