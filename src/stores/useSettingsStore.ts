import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export interface Settings {
  rolloverHour: number;
  defaultRestSeconds: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },

      setSettings: (next) =>
        set((state) => ({
          settings: { ...state.settings, ...next },
        })),

      reset: () => set({ settings: { ...DEFAULT_SETTINGS } }),
    }),
    { name: "settings" },
  ),
);

// Re-export a helper that the persistence layer calls after changes.
