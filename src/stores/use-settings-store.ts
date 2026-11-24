import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import {
  migrateSettings,
  type PersistedSettings,
} from "@/services/settings-migration";
import { settingsStorage } from "@/services/settings-storage";

export interface Settings {
  rolloverHour: number;
  defaultRestSeconds: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  onboarded: boolean;
}

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist<SettingsStore, [], [], PersistedSettings>(
      (set) => ({
        settings: { ...DEFAULT_SETTINGS },

        setSettings: (next) =>
          set((state) => ({
            settings: { ...state.settings, ...next },
          })),

        reset: () => set({ settings: { ...DEFAULT_SETTINGS } }),
      }),
      {
        name: "tally.settings",
        // v2 added `onboarded`; the migration makes the old shape explicit
        // instead of letting the gate read an undefined flag.
        version: 2,
        storage: createJSONStorage(() => settingsStorage),
        partialize: (state) => ({ settings: state.settings }),
        migrate: (persisted) => migrateSettings(persisted),
      },
    ),
    { name: "settings" },
  ),
);
