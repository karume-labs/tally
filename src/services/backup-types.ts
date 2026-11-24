export interface BackupMetadata {
  version: number;
  exportedAt: number;
  appVersion: string;
  recordCounts: Record<string, number>;
}

export interface BackupExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  isCustom: boolean | null;
  createdAt: Date;
}

export interface BackupSplit {
  id: string;
  name: string;
  description: string | null;
  isPreset: boolean | null;
  isActive: boolean | null;
  schedule: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupSplitDay {
  id: string;
  splitId: string;
  name: string;
  dayOrder: number;
  isRestDay: boolean | null;
}

export interface BackupSplitDayExercise {
  id: string;
  splitDayId: string;
  exerciseId: string;
  order: number;
  targetSets: number | null;
  targetReps: string | null;
  restSeconds: number | null;
  notes: string | null;
}

export interface BackupSession {
  id: string;
  splitDayId: string | null;
  splitDayName: string | null;
  startedAt: Date;
  endedAt: Date | null;
  notes: string | null;
  durationSeconds: number | null;
  totalVolume: number | null;
  prCount: number | null;
}

export interface BackupSetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  isPR: boolean | null;
  completedAt: Date;
}

export interface BackupStreakState {
  id: number;
  currentStreak: number | null;
  longestStreak: number | null;
  lastLogDayKey: string | null;
  freezesAvailable: number | null;
  freezesUsed: number | null;
  xp: number | null;
  level: number | null;
  totalSessions: number | null;
  totalVolume: number | null;
}

export interface BackupStreakHistory {
  dayKey: string;
  status: string;
  sessionId: string | null;
  xpEarned: number | null;
}

export interface BackupXpEvent {
  id: string;
  eventType: string;
  xpAmount: number;
  description: string | null;
  createdAt: Date;
}

export interface FullBackup {
  metadata: BackupMetadata;
  data: {
    exercises: BackupExercise[];
    splits: BackupSplit[];
    splitDays: BackupSplitDay[];
    splitDayExercises: BackupSplitDayExercise[];
    sessions: BackupSession[];
    setLogs: BackupSetLog[];
    streakState: BackupStreakState[];
    streakHistory: BackupStreakHistory[];
    xpEvents: BackupXpEvent[];
  };
}
