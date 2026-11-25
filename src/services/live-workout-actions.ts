import { type Event, EventType } from "react-native-notify-kit";

export const SKIP_REST_ACTION = "skip-rest";
export const FINISH_WORKOUT_ACTION = "finish-workout";

interface LiveWorkoutHandlers {
  skipRest: () => void;
  finish: () => void;
}

let handlers: LiveWorkoutHandlers | null = null;

/**
 * Actions are handled by the mounted workout screen: only it knows which
 * exercise is focused, can advance it, and can navigate to the summary. A
 * rest timer or session it cannot see (app killed, session already closed) is
 * left alone rather than half-finished from a headless context.
 */
export const registerLiveWorkoutHandlers = (
  next: LiveWorkoutHandlers,
): (() => void) => {
  handlers = next;
  return () => {
    if (handlers === next) handlers = null;
  };
};

/** Shared by the foreground and background notifee handlers. */
export const handleLiveWorkoutEvent = (event: Event): void => {
  if (event.type !== EventType.ACTION_PRESS) return;
  const actionId = event.detail.pressAction?.id;

  if (actionId === SKIP_REST_ACTION) {
    handlers?.skipRest();
    return;
  }
  if (actionId === FINISH_WORKOUT_ACTION) {
    handlers?.finish();
  }
};
