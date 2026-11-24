import { parseISO } from "date-fns";
import {
  FREEZE_EARN_AT,
  MAX_FREEZES,
  STREAK_MILESTONES,
  type StreakMilestone,
  XP_VALUES,
} from "@/lib/constants";
import type { StreakCalcResult } from "./streak-types";

export const calculateStreak = (
  currentStreak: number,
  longestStreak: number,
  lastLogDayKey: string | null,
  loggedDayKey: string,
  status: "workout" | "rest" | "freeze",
  _rolloverHour: number = 6,
): StreakCalcResult => {
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

  const todayDate = parseISO(loggedDayKey);
  const lastDate = lastLogDayKey ? parseISO(lastLogDayKey) : null;
  const logDate = todayDate;

  let newCurrentStreak: number;
  let streakChanged = false;
  let diffDays = 0;

  if (lastDate == null) {
    newCurrentStreak = 1;
    streakChanged = true;
  } else {
    diffDays = Math.round(
      (logDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      newCurrentStreak = currentStreak + 1;
      streakChanged = newCurrentStreak !== currentStreak;
    } else if (diffDays === 0) {
      newCurrentStreak = currentStreak;
      streakChanged = false;
    } else {
      newCurrentStreak = 1;
      streakChanged = true;
    }
  }

  const newLongestStreak = Math.max(longestStreak, newCurrentStreak);

  let milestoneXP = 0;
  let milestoneReached: StreakMilestone[] | null = null;
  for (const m of STREAK_MILESTONES) {
    if (newCurrentStreak === m) {
      milestoneXP += XP_VALUES.streakMilestone(m);
      if (!milestoneReached) milestoneReached = [];
      milestoneReached.push(m);
    }
  }

  const streakBonusXP =
    newCurrentStreak >= 2 ? Math.min(newCurrentStreak * 5, 50) : 0;
  const earnedFreeze =
    (FREEZE_EARN_AT as readonly number[]).includes(newCurrentStreak) &&
    newCurrentStreak < MAX_FREEZES;

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
};
