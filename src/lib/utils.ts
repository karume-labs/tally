import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { parseISO, startOfDay } from "date-fns";
import { twMerge } from "tailwind-merge";

export type { ClassValue };

import { EQUIPMENT, MUSCLE_GROUPS } from "./constants";

// ─── shadcn cn (single source of truth in this file) ────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Volume ──────────────────────────────────────────────────────────────────────
export function calculateVolume(
  weight: number | null | undefined,
  reps: number | null | undefined,
): number {
  if (weight == null || reps == null || weight <= 0 || reps <= 0) return 0;
  return weight * reps;
}

// ─── Set PR detection ────────────────────────────────────────────────────────────
export interface SetPRCheck {
  isPR: boolean;
  reason?: string;
}

export function checkSetPR(
  weight: number | null | undefined,
  reps: number | null | undefined,
  bestWeight: number | null,
  bestReps: number | null,
  bestVolume: number | null,
): SetPRCheck {
  const volume = calculateVolume(weight, reps);
  if (volume == null || volume <= 0) return { isPR: false };

  // Volume PR
  if (bestVolume != null && volume > bestVolume && volume > 0) {
    return { isPR: true, reason: "volume" };
  }

  // Weight PR (same or more reps than best at that weight)
  if (
    bestWeight != null &&
    weight != null &&
    weight > bestWeight &&
    reps != null &&
    reps > 0
  ) {
    return { isPR: true, reason: "weight" };
  }

  // Reps PR (same weight, more reps)
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
}

// ─── Date helpers ────────────────────────────────────────────────────────────────
export function toDayKey(date: Date = new Date()): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function parseDayKey(key: string): Date {
  return parseISO(key);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── Day rollover ────────────────────────────────────────────────────────────────
/**
 * Returns the "log day key" for a timestamp given the user's rollover hour.
 * Night owls whose day starts at 6am: a workout at 2am counts toward the
 * previous calendar day's streak.
 */
export function dayKeyForTimestamp(unixMs: number, rolloverHour = 6): string {
  const date = new Date(unixMs);
  const local = startOfDay(date);
  const hour = date.getHours();
  if (hour < rolloverHour) {
    local.setDate(local.getDate() - 1);
  }
  return local.toISOString().slice(0, 10);
}

// ─── Rest timer ──────────────────────────────────────────────────────────────────
export function formatRestRemaining(endsAt: number): string {
  const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
  if (remaining <= 0) return "0:00";
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function isRestExpired(endsAt: number): boolean {
  return Date.now() >= endsAt;
}

// ─── Validation ──────────────────────────────────────────────────────────────────
export function isValidMuscleGroup(
  value: string,
): value is (typeof MUSCLE_GROUPS)[number] {
  return MUSCLE_GROUPS.includes(value as (typeof MUSCLE_GROUPS)[number]);
}

export function isValidEquipment(
  value: string,
): value is (typeof EQUIPMENT)[number] {
  return EQUIPMENT.includes(value as (typeof EQUIPMENT)[number]);
}

// ─── Formatting ──────────────────────────────────────────────────────────────────
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatVolume(volume: number | null | undefined): string {
  if (volume == null || volume <= 0) return "0 kg";
  return `${Math.round(volume)} kg`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
