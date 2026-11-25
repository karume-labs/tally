import type { StreakMilestone } from "@/lib/constants";

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

export interface SessionXPResult {
  baseXP: number;
  prXP: number;
  streakBonusXP: number;
  milestoneXP: number;
  totalXP: number;
}

export interface DayDot {
  dayKey: string;
  status: "workout" | "rest" | "freeze" | "missed";
}
