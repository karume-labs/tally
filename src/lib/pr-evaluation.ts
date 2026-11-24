import { calculateVolume, checkSetPR } from "./utils";

export interface PrBest {
  bestWeight: number | null;
  bestReps: number | null;
  bestVolume: number | null;
}

export interface PrEvaluationResult {
  isPR: boolean;
  updatedBest: PrBest;
}

export const evaluateSetLog = (
  weight: number | null,
  reps: number | null,
  _rpe: number | null,
  _completedAt: number,
  best: PrBest,
): PrEvaluationResult => {
  const volume = calculateVolume(weight, reps);
  const prCheck = checkSetPR(
    weight,
    reps,
    best.bestWeight,
    best.bestReps,
    best.bestVolume,
  );
  const isPR = !!prCheck.isPR;

  const updatedBest: PrBest = isPR
    ? {
        bestWeight:
          weight != null &&
          (best.bestWeight == null || weight > best.bestWeight)
            ? weight
            : best.bestWeight,
        bestReps:
          weight != null &&
          reps != null &&
          (best.bestReps == null ||
            (weight === best.bestWeight && reps > best.bestReps) ||
            (best.bestWeight == null && reps > best.bestReps))
            ? reps
            : best.bestReps,
        bestVolume: volume > (best.bestVolume ?? 0) ? volume : best.bestVolume,
      }
    : best;

  return { isPR, updatedBest };
};

export const recomputeTotals = (
  exercises: Array<{
    sets: Array<{
      completed: boolean;
      weight: number | null;
      reps: number | null;
    }>;
  }>,
) => {
  let totalVolume = 0;
  let completedSets = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.completed && s.weight != null && s.reps != null) {
        totalVolume += s.weight * s.reps;
        completedSets++;
      }
    }
  }
  return { totalVolume, completedSets };
};
