import { describe, expect, test } from "bun:test";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { migrateSettings } from "./settings-migration";

describe("migrateSettings", () => {
  test("gives pre-flag installs an explicit onboarded: false", () => {
    const migrated = migrateSettings({
      settings: {
        rolloverHour: 4,
        defaultRestSeconds: 60,
        hapticsEnabled: false,
        soundEnabled: false,
      },
    });

    expect(migrated.settings.onboarded).toBe(false);
    expect(migrated.settings.rolloverHour).toBe(4);
    expect(migrated.settings.defaultRestSeconds).toBe(60);
  });

  test("keeps a completed onboarding", () => {
    const migrated = migrateSettings({
      settings: { ...DEFAULT_SETTINGS, onboarded: true },
    });

    expect(migrated.settings.onboarded).toBe(true);
  });

  test("treats a missing or broken state as a fresh install", () => {
    expect(migrateSettings(undefined).settings.onboarded).toBe(false);
    expect(migrateSettings(null).settings.onboarded).toBe(false);
    expect(JSON.stringify(migrateSettings({}).settings)).toBe(
      JSON.stringify(DEFAULT_SETTINGS),
    );
  });
});
