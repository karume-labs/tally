import { useEffect, useState } from "react";
import { useWorkoutStore } from "@/stores/use-workout-store";

export interface SetInputs {
  weight: string;
  reps: string;
  rpe: string;
  setWeight: (value: string) => void;
  setReps: (value: string) => void;
  setRpe: (value: string) => void;
  logSet: () => void;
}

/**
 * The weight/reps/rpe fields for the open exercise, plus the set they log. The
 * store is read at call time so a tap logs against the sets that exist then.
 */
export const useSetInputs = (activeExerciseId: string | null): SetInputs => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");

  // Opening an exercise seeds the inputs from its last logged set, so a whole
  // exercise is one tap per set once the first numbers are in.
  useEffect(() => {
    if (activeExerciseId == null) return;
    const exercise = useWorkoutStore
      .getState()
      .exercises.find((row) => row.exerciseId === activeExerciseId);
    const last = exercise?.sets[exercise.sets.length - 1];
    setWeight(last?.weight != null ? String(last.weight) : "");
    setReps(last?.reps != null ? String(last.reps) : "");
    setRpe("");
  }, [activeExerciseId]);

  const logSet = () => {
    if (activeExerciseId == null) return;
    const state = useWorkoutStore.getState();
    const exercise = state.exercises.find(
      (row) => row.exerciseId === activeExerciseId,
    );
    if (exercise == null) return;

    const parsedWeight = weight.trim() === "" ? null : Number(weight);
    const parsedReps = reps.trim() === "" ? null : Number.parseInt(reps, 10);
    if (
      parsedWeight == null ||
      parsedReps == null ||
      Number.isNaN(parsedWeight) ||
      Number.isNaN(parsedReps)
    ) {
      return;
    }
    const parsedRpe = rpe.trim() === "" ? null : Number(rpe);
    const logged = state.logSet(
      exercise.exerciseId,
      exercise.sets.length + 1,
      parsedWeight,
      parsedReps,
      parsedRpe,
      Date.now(),
    );
    if (logged == null) return;
    // Weight and reps stay put for the next set: repeating the same numbers is
    // the common case, and hands-free mode should not need a retype.
    setRpe("");
  };

  return { weight, reps, rpe, setWeight, setReps, setRpe, logSet };
};
