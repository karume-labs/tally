import { useEffect, useState } from "react";

/** Seconds since `startedAt`, ticking once a second while a session runs. */
export const useElapsedSeconds = (startedAt: number | null): number => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt == null) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return elapsed;
};
