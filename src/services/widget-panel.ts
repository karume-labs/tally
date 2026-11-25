import { createMMKV } from "react-native-mmkv";

/**
 * Which panel the Today widget is showing. Kept apart from the widget data so
 * the task handler can flip it on a tap without rewriting every payload, and
 * so the widget remembers where it was after a launcher restart.
 */
let storage: ReturnType<typeof createMMKV> | null = null;

const getStorage = (): ReturnType<typeof createMMKV> | null => {
  if (storage) return storage;
  try {
    storage = createMMKV({ id: "tally-widget" });
  } catch (err) {
    console.warn("[tally.widgetPanel] MMKV init failed:", err);
    storage = null;
  }
  return storage;
};

export const PANEL_COUNT = 3;

export const readTodayPanel = (): number => {
  const raw = getStorage()?.getNumber("widget.today.panel") ?? 0;
  if (!Number.isFinite(raw)) return 0;
  return ((Math.round(raw) % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
};

export const writeTodayPanel = (index: number): number => {
  const next = ((index % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
  getStorage()?.set("widget.today.panel", next);
  return next;
};

export const stepTodayPanel = (direction: 1 | -1): number =>
  writeTodayPanel(readTodayPanel() + direction);
