import { createMMKV } from "react-native-mmkv";
import type { DayDot } from "./streak";

let _storage: ReturnType<typeof createMMKV> | null = null;

const getStorage = (): ReturnType<typeof createMMKV> => {
  if (_storage) return _storage;
  try {
    _storage = createMMKV({ id: "tally-widget" });
  } catch (err) {
    console.warn("[tally.widgetSync] MMKV init failed:", err);
    _storage = null as unknown as ReturnType<typeof createMMKV>;
  }
  return _storage;
};

export interface WidgetStreakData {
  current: number;
  longest: number;
  level: number;
  xp: number;
  updatedAt: number;
}

export interface WidgetTodayData {
  dayName: string | null;
  exerciseCount: number;
  isRestDay: boolean;
  sessionActive: boolean;
  exerciseNames: string[];
  updatedAt: number;
}

// ─── Writers ─────────────────────────────────────────────────────────────────────
export const writeStreakWidgetData = (data: WidgetStreakData) => {
  const storage = getStorage();
  if (!storage) return;
  storage.set("widget.streak", JSON.stringify(data));
  storage.set("widget.updatedAt", Date.now().toString());
};

export const writeTodayWidgetData = (data: WidgetTodayData) => {
  const storage = getStorage();
  if (!storage) return;
  storage.set("widget.today", JSON.stringify(data));
  storage.set("widget.updatedAt", Date.now().toString());
};

export const writeCombinedWidgetData = () => {
  const storage = getStorage();
  if (!storage) return;
  const streakRaw = storage.getString("widget.streak");
  const todayRaw = storage.getString("widget.today");
  const combined = {
    streak: streakRaw ? JSON.parse(streakRaw) : null,
    today: todayRaw ? JSON.parse(todayRaw) : null,
  };
  storage.set("widget.data", JSON.stringify(combined));
  storage.set("widget.updatedAt", Date.now().toString());
};

// ─── Readers (used by the widget task handler when app is killed) ────────────────
export const readStreakWidgetData = (): WidgetStreakData | null => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getString("widget.streak");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetStreakData;
  } catch {
    return null;
  }
};

export const readTodayWidgetData = (): WidgetTodayData | null => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getString("widget.today");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetTodayData;
  } catch {
    return null;
  }
};

export const readLast7Dots = (): DayDot[] => {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getString("widget.streak.last7");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DayDot[];
  } catch {
    return [];
  }
};

export const writeLast7Dots = (dots: DayDot[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.set("widget.streak.last7", JSON.stringify(dots));
};

// ─── Refresh helper ──────────────────────────────────────────────────────────────
let requestWidgetUpdateImpl:
  | ((opts: {
      widgetName: string;
      renderWidget: (widget: React.ReactElement) => void;
    }) => void)
  | null = null;

export const setRequestWidgetUpdate = (
  impl: typeof requestWidgetUpdateImpl,
) => {
  requestWidgetUpdateImpl = impl;
};

export const refreshWidgets = () => {
  const storage = getStorage();
  if (storage) {
    storage.set("widget.updatedAt", Date.now().toString());
  }
  if (requestWidgetUpdateImpl) {
    requestWidgetUpdateImpl({
      widgetName: "Streak",
      renderWidget: () => {},
    });
    requestWidgetUpdateImpl({
      widgetName: "TodayWorkout",
      renderWidget: () => {},
    });
  }
};
