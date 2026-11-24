import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

// Settings must survive app restarts. MMKV is the app's fast local store; the
// in-memory map keeps persistence working if MMKV is unavailable (e.g. web).
const memory = new Map<string, string>();

const getStorage = (): ReturnType<typeof createMMKV> | null => {
  try {
    return createMMKV({ id: "tally-settings" });
  } catch (err) {
    console.warn("[tally.settings] MMKV init failed:", err);
    return null;
  }
};

const storage = getStorage();

export const settingsStorage: StateStorage = {
  getItem: (name) => storage?.getString(name) ?? memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
    storage?.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
    storage?.remove(name);
  },
};
