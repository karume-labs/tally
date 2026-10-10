import { addDays, parseISO, startOfDay } from "date-fns";
import {
  FREEZE_EARN_AT,
  MAX_FREEZES,
  STREAK_MILESTONES,
  type StreakMilestone,
  XP_VALUES,
} from "@/lib/constants";
import { dayKeyForTimestamp, toDayKey } from "@/lib/utils";

export interface ActiveSplitSchedule {
  // weekday -> split day name
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface TodayResult {
  dayKey: string;
  status: "workout" | "rest" | "no-split";
  splitDayName: string | null;
  isRestDay: boolean;
}

// ─── Today's status ──────────────────────────────────────────────────────────────
export function getTodayStatus(
  schedule: ActiveSplitSchedule | null,
  isActive: boolean,
  rolloverHour: number = 6,
): TodayResult {
  if (!isActive || !schedule) {
    return {
      dayKey: toDayKey(),
      status: "no-split",
      splitDayName: null,
      isRestDay: false,
    };
  }

  const now = new Date();
  const dayKey = dayKeyForTimestamp(now.getTime(), rolloverHour);
  const dayOfWeek = startOfDay(now).getDay(); // 0=Sun,1=Mon,...
  const weekdayKeys = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ] as const;
  const weekday = weekdayKeys[dayOfWeek];

  const splitDayName = schedule[weekday] ?? null;
  const isRestDay = splitDayName === "Rest" || splitDayName === "rest" || false;

  // Determine actual rest vs workout from the split day name matching a rest day.
  // We treat a day as "rest" only if the assigned split day is a rest day in the DB.
  // Here we only have the schedule mapping name->weekday; the rest flag lives on
  // the split day row. For home-screen purposes, pass the name through and let the
  // screen check the split day's isRestDay flag.
  const status: "workout" | "rest" | "no-split" =
    splitDayName == null ? "no-split" : isRestDay ? "rest" : "workout";

  return { dayKey, status, splitDayName, isRestDay };
}

// ─── Streak calculation ──────────────────────────────────────────────────────────
export interface StreakCalcResult {
  newCurrentStreak: number;
  newLongestStreak: number;
  streakChanged: boolean;
  streakBonusXP: number;
  milestoneXP: number;
  milestoneReached: StreakMilestone[] | null;
  earnedFreeze: boolean;
  shouldRepairAvailable: boolean;
  lastLogDayKey: string | null;
}

export function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastLogDayKey: string | null,
  loggedDayKey: string,
  status: "workout" | "rest" | "freeze",
  _rolloverHour: number = 6,
): StreakCalcResult {
  // Rest days and freezes do not increment the streak; they preserve it.
  if (status === "rest" || status === "freeze") {
    return {
      newCurrentStreak: currentStreak,
      newLongestStreak: longestStreak,
      streakChanged: false,
      streakBonusXP: 0,
      milestoneXP: 0,
      milestoneReached: null,
      earnedFreeze: false,
      shouldRepairAvailable: false,
      lastLogDayKey: loggedDayKey,
    };
  }

  // Workout logged: determine continuity.
  const _today = toDayKey();
  const todayDate = parseISO(loggedDayKey);
  const lastDate = lastLogDayKey ? parseISO(lastLogDayKey) : null;

  // If logging historically (backfill), use the logged day, not today.
  const logDate = todayDate;

  let newCurrentStreak: number;
  let streakChanged = false;

  let diffDays = 0;
  if (lastDate == null) {
    // First ever workout.
    newCurrentStreak = 1;
    streakChanged = true;
  } else {
    diffDays = Math.round(
      (logDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      // Consecutive day.
      newCurrentStreak = currentStreak + 1;
      streakChanged = newCurrentStreak !== currentStreak;
    } else if (diffDays === 0) {
      // Same day as last log — don't double count.
      newCurrentStreak = currentStreak;
      streakChanged = false;
    } else {
      // Broken streak.
      newCurrentStreak = 1;
      streakChanged = true;
    }
  }

  const newLongestStreak = Math.max(longestStreak, newCurrentStreak);

  // Milestone XP.
  let milestoneXP = 0;
  let milestoneReached: StreakMilestone[] | null = null;
  for (const m of STREAK_MILESTONES) {
    if (newCurrentStreak === m) {
      milestoneXP += XP_VALUES.streakMilestone(m);
      if (!milestoneReached) milestoneReached = [];
      milestoneReached.push(m);
    }
  }

  // Streak bonus XP for maintaining: small bonus per consecutive day beyond 2.
  const streakBonusXP =
    newCurrentStreak >= 2 ? Math.min(newCurrentStreak * 5, 50) : 0; // Freeze earned at milestones 7/30/100 (not 365).
  const earnedFreeze =
    (FREEZE_EARN_AT as readonly number[]).includes(newCurrentStreak) &&
    newCurrentStreak < MAX_FREEZES;

  // Repair availability: within 2 days of a break, offer repair.
  const shouldRepairAvailable =
    lastDate != null && diffDays > 1 && diffDays <= 2;

  return {
    newCurrentStreak,
    newLongestStreak,
    streakChanged,
    streakBonusXP,
    milestoneXP,
    milestoneReached,
    earnedFreeze,
    shouldRepairAvailable,
    lastLogDayKey: loggedDayKey,
  };
}

// ─── XP for a completed session ──────────────────────────────────────────────────
export interface SessionXPResult {
  baseXP: number;
  prXP: number;
  streakBonusXP: number;
  milestoneXP: number;
  totalXP: number;
}

export function calculateSessionXP(
  sessionCompleteBase: number = XP_VALUES.sessionComplete,
  prCount: number = 0,
  streakBonusXP: number = 0,
  milestoneXP: number = 0,
): SessionXPResult {
  const prXP = prCount * XP_VALUES.prPerSet;
  const totalXP = sessionCompleteBase + prXP + streakBonusXP + milestoneXP;
  return {
    baseXP: sessionCompleteBase,
    prXP,
    streakBonusXP,
    milestoneXP,
    totalXP,
  };
}

// ─── Weekly history for widget ───────────────────────────────────────────────────
export interface DayDot {
  dayKey: string;
  status: "workout" | "rest" | "freeze" | "missed";
}

export function last7DayDots(
  history: Array<{ dayKey: string; status: string }>,
  loggedDayKey: string | null,
): DayDot[] {
  const map = new Map(
    history.map((h) => [h.dayKey, h.status as DayDot["status"]]),
  );
  const dots: DayDot[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(startOfDay(new Date()), -i);
    const key = toDayKey(date);
    const status = map.get(key);
    if (status) {
      dots.push({ dayKey: key, status });
    } else if (loggedDayKey === key) {
      dots.push({ dayKey: key, status: "workout" });
    } else {
      dots.push({ dayKey: key, status: "missed" });
    }
  }
  return dots;
}
