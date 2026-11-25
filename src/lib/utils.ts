import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type { ClassValue };

import { EQUIPMENT, MUSCLE_GROUPS } from "./constants";

// ─── shadcn cn (single source of truth in this file) ────────────────────────────
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// ─── Volume ──────────────────────────────────────────────────────────────────────
export const calculateVolume = (
  weight: number | null | undefined,
  reps: number | null | undefined,
): number => {
  if (weight == null || reps == null || weight <= 0 || reps <= 0) return 0;
  return weight * reps;
};

// ─── Set PR detection ────────────────────────────────────────────────────────────
export interface SetPRCheck {
  isPR: boolean;
  reason?: string;
}

export const checkSetPR = (
  weight: number | null | undefined,
  reps: number | null | undefined,
  bestWeight: number | null,
  bestReps: number | null,
  bestVolume: number | null,
): SetPRCheck => {
  const volume = calculateVolume(weight, reps);
  if (volume == null || volume <= 0) return { isPR: false };

  if (bestVolume != null && volume > bestVolume && volume > 0) {
    return { isPR: true, reason: "volume" };
  }

  if (
    bestWeight != null &&
    weight != null &&
    weight > bestWeight &&
    reps != null &&
    reps > 0
  ) {
    return { isPR: true, reason: "weight" };
  }

  if (
    bestWeight != null &&
    weight === bestWeight &&
    reps != null &&
    bestReps != null &&
    reps > bestReps
  ) {
    return { isPR: true, reason: "reps" };
  }

  return { isPR: false };
};

// ─── Ids ─────────────────────────────────────────────────────────────────────────
// Hermes does not always expose crypto.randomUUID, so fall back to a local id
// instead of throwing when a session starts or finishes.
export const createId = (): string => {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `tally_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

// ─── Rest timer ──────────────────────────────────────────────────────────────────
export const formatRestRemaining = (endsAt: number): string => {
  const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
  if (remaining <= 0) return "0:00";
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const isRestExpired = (endsAt: number): boolean => Date.now() >= endsAt;

// ─── Validation ──────────────────────────────────────────────────────────────────
export const isValidMuscleGroup = (
  value: string,
): value is (typeof MUSCLE_GROUPS)[number] =>
  MUSCLE_GROUPS.includes(value as (typeof MUSCLE_GROUPS)[number]);

export const isValidEquipment = (
  value: string,
): value is (typeof EQUIPMENT)[number] =>
  EQUIPMENT.includes(value as (typeof EQUIPMENT)[number]);

// ─── Formatting ──────────────────────────────────────────────────────────────────
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatVolume = (volume: number | null | undefined): string => {
  if (volume == null || volume <= 0) return "0 kg";
  return `${Math.round(volume)} kg`;
};

export const formatNumber = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};
