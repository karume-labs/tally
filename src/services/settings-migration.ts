import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { Settings } from "@/stores/use-settings-store";

export interface PersistedSettings {
  settings: Settings;
}

/**
 * Version 1 of the settings store predates `onboarded`, so its saved object has
 * no such key. Hydrating that directly would leave the tab gate reading
 * `undefined`; writing a real `false` keeps the persisted shape honest and sends
 * those installs through onboarding exactly once.
 *
 * Everything else in the saved object is kept, and anything missing falls back
 * to the defaults, so a partially written store cannot wipe a user's settings.
 */
export const migrateSettings = (persisted: unknown): PersistedSettings => {
  const saved = persisted as { settings?: Partial<Settings> } | null;
  const settings = saved?.settings;
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
      onboarded: settings?.onboarded === true,
    },
  };
};
