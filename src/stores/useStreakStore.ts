import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { StreakMilestone } from "@/lib/constants";

export interface StreakRow {
  id: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDayKey: string | null;
  freezesAvailable: number;
  freezesUsed: number;
  xp: number;
  level: number;
  totalSessions: number;
  totalVolume: number;
}

interface StreakStore {
  row: StreakRow | null;
  xpHistory: {
    eventId: string;
    eventType: string;
    xpAmount: number;
    description: string | null;
    createdAt: Date;
  }[];
  milestones: StreakMilestone[];

  setRow: (row: StreakRow) => void;
  addXP: (
    amount: number,
    eventType: string,
    description: string | null,
    eventId: string,
  ) => void;
  logWorkoutDay: (
    dayKey: string,
    xpEarned: number,
    sessionId: string | null,
    status: "workout" | "rest" | "freeze",
  ) => void;
  useFreeze: () => boolean;
  refreshMilestones: () => void;
  reset: () => void;
}

export const useStreakStore = create<StreakStore>()(
  devtools(
    (set, get) => ({
      row: null,
      xpHistory: [],
      milestones: [],

      setRow: (row) => set({ row }),

      addXP: (amount, eventType, description, eventId) =>
        set((state) => {
          const row = state.row;
          if (!row) return state;
          const newXP = row.xp + amount;
          const newLevel = Math.floor(newXP / 500) + 1;
          const xpHistory = [
            ...state.xpHistory,
            {
              eventId,
              eventType,
              xpAmount: amount,
              description,
              createdAt: new Date(),
            },
          ];
          return {
            row: { ...row, xp: newXP, level: newLevel },
            xpHistory,
          };
        }),

      logWorkoutDay: (dayKey, xpEarned, _sessionId, status) =>
        set((state) => {
          const row = state.row;
          if (!row) return state;
          return {
            row: {
              ...row,
              lastLogDayKey: dayKey,
              xp: row.xp + xpEarned,
              level: Math.floor((row.xp + xpEarned) / 500) + 1,
              totalSessions:
                status === "workout"
                  ? row.totalSessions + 1
                  : row.totalSessions,
              totalVolume: row.totalVolume,
            },
            xpHistory: [
              ...state.xpHistory,
              {
                eventId: `log-${dayKey}`,
                eventType: "session_complete",
                xpAmount: xpEarned,
                description: `Workout on ${dayKey}`,
                createdAt: new Date(),
              },
            ],
          };
        }),

      useFreeze: () => {
        const row = get().row;
        if (!row || row.freezesAvailable <= 0) return false;
        set({
          row: {
            ...row,
            freezesAvailable: row.freezesAvailable - 1,
            freezesUsed: row.freezesUsed + 1,
          },
        });
        return true;
      },

      refreshMilestones: () =>
        set({
          milestones: [7, 30, 100, 365].filter(
            (m) => (get().row?.currentStreak ?? 0) >= m,
          ) as StreakMilestone[],
        }),

      reset: () => set({ row: null, xpHistory: [], milestones: [] }),
    }),
    { name: "streak" },
  ),
);
