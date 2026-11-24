import { useEffect, useState } from "react";
import { isRestExpired } from "@/lib/utils";
import { useWorkoutStore } from "@/stores/use-workout-store";

export const useRestTimer = () => {
  const restTimerEndsAt = useWorkoutStore((s) => s.restTimerEndsAt);
  const _exercises = useWorkoutStore((s) => s.exercises);

  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (restTimerEndsAt == null) {
      setIsActive(false);
      setRemaining(0);
      return;
    }
    setIsActive(true);
    const tick = () => {
      const r = Math.max(0, Math.round((restTimerEndsAt - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) setIsActive(false);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [restTimerEndsAt]);

  return {
    remaining,
    isActive,
    isExpired: restTimerEndsAt != null && isRestExpired(restTimerEndsAt),
  };
};
