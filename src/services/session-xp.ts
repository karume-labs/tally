import { XP_VALUES } from "@/lib/constants";
import type { SessionXPResult } from "./streak-types";

export const calculateSessionXP = (
  sessionCompleteBase: number = XP_VALUES.sessionComplete,
  prCount: number = 0,
  streakBonusXP: number = 0,
  milestoneXP: number = 0,
): SessionXPResult => {
  const prXP = prCount * XP_VALUES.prPerSet;
  const totalXP = sessionCompleteBase + prXP + streakBonusXP + milestoneXP;
  return {
    baseXP: sessionCompleteBase,
    prXP,
    streakBonusXP,
    milestoneXP,
    totalXP,
  };
};
